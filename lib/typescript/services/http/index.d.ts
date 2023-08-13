declare const http: {
    getAccountTokens: (address: string) => Promise<import("../../redux/slices/wallet.slice").Tokens[]>;
    getMxAccount: (address?: string | undefined) => Promise<import("../../types").MxAccount>;
};
export default http;
//# sourceMappingURL=index.d.ts.map