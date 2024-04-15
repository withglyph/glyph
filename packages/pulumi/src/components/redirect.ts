import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';

type RedirectArgs = {
  name: pulumi.Input<string>;

  from: {
    host: pulumi.Input<string>;
    path?: pulumi.Input<string>;
  };

  to: {
    host: pulumi.Input<string>;
    path?: pulumi.Input<string>;
  };

  code: pulumi.Input<301 | 302>;
};

export class Redirect extends pulumi.ComponentResource {
  constructor(name: string, args: RedirectArgs, opts?: pulumi.ComponentResourceOptions) {
    super('withglyph:index:Redirect', name, {}, opts);

    new k8s.networking.v1.Ingress(
      name,
      {
        metadata: {
          name: args.name,
          namespace: 'prod',
          annotations: {
            'alb.ingress.kubernetes.io/group.name': 'public-alb',
            'alb.ingress.kubernetes.io/listen-ports': JSON.stringify([{ HTTPS: 443 }]),
            'pulumi.com/skipAwait': 'true',
            'alb.ingress.kubernetes.io/actions.redirect': pulumi.all([args.to, args.code]).apply(([to, code]) =>
              JSON.stringify({
                type: 'redirect',
                redirectConfig: {
                  host: to.host,
                  path: to.path,
                  statusCode: `HTTP_${code}`,
                },
              }),
            ),
          },
        },
        spec: {
          ingressClassName: 'alb',
          rules: [
            {
              host: args.from.host,
              http: {
                paths: [
                  {
                    path: args.from.path ?? '/*',
                    pathType: 'ImplementationSpecific',
                    backend: {
                      service: {
                        name: 'redirect',
                        port: { name: 'use-annotation' },
                      },
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      { parent: this },
    );
  }
}
