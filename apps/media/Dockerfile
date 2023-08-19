FROM --platform=linux/arm64 public.ecr.aws/lambda/nodejs:18 as builder
RUN npm install --no-save sharp
COPY package.json ${LAMBDA_TASK_ROOT}
COPY dist/ ${LAMBDA_TASK_ROOT}

FROM --platform=linux/arm64 public.ecr.aws/lambda/nodejs:18
COPY --from=builder ${LAMBDA_TASK_ROOT} ${LAMBDA_TASK_ROOT}
