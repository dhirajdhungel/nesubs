import crypto from "node:crypto";

type FonePayOptions = {
  dynamicQrCodeEndpoint: string;
};

const DEFAULT_FONEPAY_OPTIONS = {
  dynamicQrCodeEndpoint:
    "https://merchantapi.fonepay.com/api/merchant/merchantDetailsForThirdParty",
};

export type FonePayGeneratedQRResponse = {
  qrMessage: string;
  clientCode: string;
  status: "CREATED";
  statusCode: number;
  success: boolean;
  deviceId: string;
  requested_date: string;
  merchantCode: string;
  merchantWebSocketUrl: string;
  thirdpartyQrWebSocketUrl: string;
  nfcThirdPartyQrUrl: string;
};

export type FonePayProps = {
  username: string;
  password: string;
  secret: string;
  fonepayPan: string;
  options?: Partial<FonePayOptions>;
};

export type FonePayWSTransactionStatus = {
  traceId: number;
  remarks1: string;
  transactionDate: string;
  productNumber: string;
  amount: number;
  message: string;
  success: boolean;
  commissionType: "Charge";
  commissionAmount: number;
  totalCalculatedAmount: number;
  paymentSuccess: boolean;
};

export type FonePayWSMessageType = {
  merchantId: string;
  deviceId: string;
  transactionStatus: string;
  socketUrl: string;
};

export type FonePayVerifyQRResponse = {
  prn: string;
  merchantCode: string;
  requestedAmount: string;
  totalTransactionAmount: string;
} & (
  | {
      paymentStatus: "failed";
    }
  | {
      paymentStatus: "success";
      fonepayTraceId: number;
    }
);

export class FonePay {
  #username: string;
  #password: string;
  #secret: string;
  #fonepayPan: string;

  #options: FonePayOptions;

  constructor({
    password,
    secret,
    username,
    options,
    fonepayPan,
  }: FonePayProps) {
    this.#password = password;
    this.#secret = secret;
    this.#username = username;
    this.#options = Object.assign({}, DEFAULT_FONEPAY_OPTIONS, options || {});
    this.#fonepayPan = fonepayPan;
  }

  async generateDynamicQR({
    amount: _amount,
    prn,
    remarks,
  }: {
    amount: string;
    prn: string;
    remarks: string;
  }) {
    try {
      const url = `${this.#options.dynamicQrCodeEndpoint}/thirdPartyDynamicQrDownload`;

      // The amount is calculated. Fonepay expects it to be divided by 100 if we pass paisa, or divided depending on how it's defined.
      // Math.max(1, +_amount / 100).toFixed(2);
      // Wait, is _amount passed in Rupees or Paisa?
      // Usually, if the amount passed to generateDynamicQR is in Rupees, then dividing by 100 might make it 100x smaller.
      // But the provided class does:
      // const amount = Math.max(1, +_amount / 100).toFixed(2);
      // Let's use the provided code exactly as requested.
      const amount = Math.max(1, +_amount / 100).toFixed(2);

      // Create data validation hash
      const dataToHash = `${amount},${prn},${this.#fonepayPan},${remarks}`;
      const dataValidation = crypto
        .createHmac("sha512", this.#secret)
        .update(dataToHash)
        .digest("hex");

      // Prepare payload
      const payload = {
        amount,
        remarks1: remarks,
        prn, // Payment Reference Number
        merchantCode: this.#fonepayPan,
        dataValidation,
        username: this.#username,
        password: this.#password,
      };

      const headers = {
        "Content-Type": "application/json",
      };

      const response = await fetch(url, {
        body: JSON.stringify(payload),
        headers,
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(
          `Dynamic QR generation failed, status: ${response.status}, statusText: ${response.statusText}`
        );
      }

      const data = (await response.json()) as FonePayGeneratedQRResponse;

      if (!data.success) {
        throw new Error(
          `Dynamic QR Generation failed. The response has "success" field set to false. JSON dump: ${JSON.stringify(data)}`
        );
      }

      return data;
    } catch (error) {
      throw new Error(
        `Failed to generate QR code: ${(error as Error).message}`
      );
    }
  }

  async verifyQRPaymentStatus({ prn }: { prn: string }) {
    try {
      const url = `${this.#options.dynamicQrCodeEndpoint}/thirdPartyDynamicQrGetStatus`;

      // Create validation hash for verification
      const dataToHash = `${prn},${this.#fonepayPan}`;
      const dataValidation = crypto
        .createHmac("sha512", this.#secret)
        .update(dataToHash)
        .digest("hex");

      const payload = {
        prn,
        merchantCode: this.#fonepayPan,
        dataValidation,
        username: this.#username,
        password: this.#password,
      };

      const headers = {
        "Content-Type": "application/json",
      };

      const response = await fetch(url, {
        body: JSON.stringify(payload),
        headers,
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(
          `Dynamic QR status check failed, status: ${response.status}, statusText: ${response.statusText}`
        );
      }
      const data = (await response.json()) as FonePayVerifyQRResponse;

      return data;
    } catch (error) {
      console.error("Error verifying QR code:", error);
      return { success: false, paymentStatus: "failed" as const, message: (error as Error).message };
    }
  }
}
