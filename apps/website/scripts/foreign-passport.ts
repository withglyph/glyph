/* eslint-disable unicorn/no-process-exit */
import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';
import dayjs from 'dayjs';
import { and, eq, inArray, ne } from 'drizzle-orm';
import { setupDayjs } from '$lib/datetime';
import { database, PointPurchases, UserPersonalIdentities, Users } from '$lib/server/database';
import { sendTextEmail } from '$lib/server/email';
import { useFirstRow } from '$lib/server/utils/database';

setupDayjs();
const rl = createInterface(stdin, stdout);

// eslint-disable-next-line no-constant-condition
while (true) {
  const email = await rl.question('유저 이메일 입력(미입력시 종료): ');
  if (email.length === 0) {
    break;
  }

  const userWithIdentity = await database
    .select({
      id: Users.id,
      personalIdentity: {
        kind: UserPersonalIdentities.kind,
        birthday: UserPersonalIdentities.birthday,
        ci: UserPersonalIdentities.ci,
      },
    })
    .from(Users)
    .leftJoin(UserPersonalIdentities, eq(Users.id, UserPersonalIdentities.userId))
    .where(eq(Users.email, email.toLowerCase()))
    .then(useFirstRow);

  if (!userWithIdentity) {
    console.log(`${email} 찾을 수 없음`);
    const answer = await rl.question(
      `${email} 회원에게 'Glyph account not found' 사유로 거부 이메일을 보낼까요? (Y/n)`,
    );

    if (answer === 'y' || answer === 'Y' || answer === 'ㅛ' || answer.length === 0) {
      await sendTextEmail({
        subject: '[Glyph] Foreign Passport Verification Rejected',
        recipient: email,
        body: `Your foreign identity verification is rejected. Reason: Glyph account not found`,
      });
    }

    continue;
  }

  if (userWithIdentity.personalIdentity && userWithIdentity.personalIdentity.kind !== 'FOREIGN_PASSPORT') {
    const answer = await rl.question(`${email} 이미 국내 인증 존재!! (도용 의심) 덮어쓸까요? (y/N): `);
    if (answer !== 'y' && answer !== 'Y' && answer !== 'ㅛ') {
      continue;
    }
  }

  const usedNationalPaymentMethods = await database
    .select({ paymentMethod: PointPurchases.paymentMethod })
    .from(PointPurchases)
    .where(
      and(
        eq(PointPurchases.userId, userWithIdentity.id),
        inArray(PointPurchases.state, ['COMPLETED', 'UNDONE']),
        ne(PointPurchases.paymentMethod, 'PAYPAL'),
      ),
    )
    .groupBy(PointPurchases.paymentMethod)
    .then((rows) => rows.map((row) => row.paymentMethod));

  if (usedNationalPaymentMethods.length > 0) {
    console.log(`${email} 국내 결제 수단 사용 이력 존재!!! (강한 도용 의심)`);
    console.log(`사용한 결제 수단: ${usedNationalPaymentMethods.join(', ')}`);
    const answer = await rl.question(`계속 인증을 진행할까요? (y/N): `);
    if (answer !== 'y' && answer !== 'Y' && answer !== 'ㅛ') {
      continue;
    }
  }

  const name = await rl.question('이름 입력("${성} ${이름}" 형식, 미입력시 인증 거부): ');

  if (name.length === 0) {
    // const reason = await rl.question('인증 거부 사유 입력: ');
    // const answer = await rl.question(`${email} 회원에게 ${reason} 사유로 거부 이메일을 보낼까요? (Y/n)`);
    // if (answer === 'y' || answer === 'Y' || answer === 'ㅛ' || answer.length === 0) {
    //   await sendTextEmail({
    //     subject: '[Glyph] Foreign Passport Verification Rejected',
    //     recipient: email,
    //     body: `Your foreign identity verification is rejected. Reason: ${reason}`,
    //   });
    // }

    console.log(`${email} 인증 거부`);
    continue;
  }

  const birthdayString = await rl.question('생년월일 입력 (YYYYMMDD): ');
  const birthday = dayjs.kst(birthdayString, 'YYYYMMDD');
  if (userWithIdentity.personalIdentity && !birthday.isSame(userWithIdentity.personalIdentity.birthday, 'day')) {
    console.log(
      `${email} 이전 인증 정보(${userWithIdentity.personalIdentity.birthday.kst().format('YYYYMMDD')})와 생년월일 불일치!!!! (강한 도용 의심)`,
    );
    const answer = await rl.question(`계속 인증을 진행할까요? (y/N): `);
    if (answer !== 'y' && answer !== 'Y' && answer !== 'ㅛ') {
      continue;
    }
  }

  const nationalCode = await rl.question('국가 코드(ISO 3166-1 alpha-3) 입력: ');
  const passportNumber = await rl.question('여권 번호 입력: ');
  const ci = `${nationalCode.toUpperCase()}-${passportNumber}`;

  const anotherIdentities = await database
    .select({ id: UserPersonalIdentities.id })
    .from(UserPersonalIdentities)
    .where(and(eq(UserPersonalIdentities.ci, ci), ne(UserPersonalIdentities.userId, userWithIdentity.id)));

  if (anotherIdentities.length > 0) {
    console.log(`${email} 이미 다른 유저가 사용중인 CI!!! 인증 불가`);
    continue;
  }

  console.log('최종 확인:');
  console.log(`이메일: ${email}`);
  console.log(`이름: ${name}`);
  console.log(`생년월일: ${birthday.format('YYYYMMDD')}`);
  console.log(`CI: ${ci}`);
  const answer = await rl.question('인증 진행? (Y/n): ');
  if (answer === 'y' || answer === 'Y' || answer === 'ㅛ' || answer.length === 0) {
    await database
      .insert(UserPersonalIdentities)
      .values({
        userId: userWithIdentity.id,
        kind: 'FOREIGN_PASSPORT',
        name,
        birthday,
        ci,
        expiresAt: dayjs.kst().add(1, 'year'),
      })
      .onConflictDoUpdate({
        target: UserPersonalIdentities.userId,
        set: {
          kind: 'FOREIGN_PASSPORT',
          name,
          birthday,
          ci,
          expiresAt: dayjs.kst().add(1, 'year'),
        },
      });

    // await sendTextEmail({
    //   subject: '[Glyph] Foreign Passport Verification Completed',
    //   recipient: email,
    //   body: `Your foreign identity verification is completed.`,
    // });

    console.log(`${email} 완료`);
  }
}
rl.close();
process.exit(0);
