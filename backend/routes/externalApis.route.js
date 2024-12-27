import { getBetHistoryP_L, getLiveMarkets, getLotteryBetHistory, lotteryMarketAnalysis } from "../controllers/externalApis.js";

export const ExternalApiModule = (app) => {
    app.post('/api/lottery-external-bet-history', getLotteryBetHistory);

    app.get('/api/lottery-external-marketAnalysis/:marketId', lotteryMarketAnalysis);

    app.post('/api/lottery-external-betHistory-profitLoss', getBetHistoryP_L);

    app.get('/api/get-live-markets', getLiveMarkets)

}