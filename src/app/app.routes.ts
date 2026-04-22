import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { FrequencyAnalysis } from './pages/frequency-analysis/frequency-analysis';
import { MarketAnalyzer } from './pages/market-analyzer/market-analyzer';
import { BatchTrader } from './pages/batch-trader/batch-trader';
import { Charts } from './pages/charts/charts';
import { FreeBots } from './pages/free-bots/free-bots';
import { Trader } from './pages/trader/trader';
import { AnalysisTool } from './pages/analysis-tool/analysis-tool';
import { Home } from './home/home';


export const routes: Routes = [
    { path: 'wiseTraders', component: Home},
    { path: '', redirectTo: '/wiseTraders', pathMatch: 'full'},
    { path: 'dashboard', component: Dashboard},
    { path: 'analysis-tool', component: AnalysisTool},
    { path: 'trader', component: Trader},
    { path: 'free-bots', component: FreeBots},
    { path: 'charts', component: Charts},
    { path: 'batch-trader', component: BatchTrader},
    { path: 'market-analyzer', component: MarketAnalyzer},
    { path: 'frequency-analysis', component: FrequencyAnalysis},
];
