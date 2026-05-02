declare module "midtrans-client" {
  interface MidtransConfig {
    isProduction: boolean;
    serverKey: string;
    clientKey?: string;
  }

  interface SnapTransactionResponse {
    token: string;
    redirect_url: string;
  }

  class Snap {
    constructor(config: MidtransConfig);
    createTransaction(parameter: Record<string, unknown>): Promise<SnapTransactionResponse>;
  }

  class CoreApi {
    constructor(config: MidtransConfig);
    transaction: {
      status(orderId: string): Promise<Record<string, unknown>>;
      cancel(orderId: string): Promise<Record<string, unknown>>;
      approve(orderId: string): Promise<Record<string, unknown>>;
      deny(orderId: string): Promise<Record<string, unknown>>;
      expire(orderId: string): Promise<Record<string, unknown>>;
      refund(orderId: string, parameter?: Record<string, unknown>): Promise<Record<string, unknown>>;
    };
  }

  const _default: { Snap: typeof Snap; CoreApi: typeof CoreApi };
  export default _default;
  export { Snap, CoreApi };
}
