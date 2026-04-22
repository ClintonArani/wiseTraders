import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxEchartsModule } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';

interface HistoryState {
  sections: any;
  growthRate: number;
  takeProfit: number;
  runOnceCode: string;
  tradeOptions: any;
  timestamp: Date;
}

@Component({
  selector: 'app-bot-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxEchartsModule],
  templateUrl: './bot-builder.html',
  styleUrls: ['./bot-builder.css'],
})
export class BotBuilderComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvasArea') canvasArea!: ElementRef;
  @ViewChild('chartContainer') chartContainer!: ElementRef;

  marketType = 'Derived';
  marketCategory = 'Continuous Indices';
  marketAsset = 'Volatility 10 (1s) Index';

  tradeType = 'Up/Down';
  tradeDirection = 'Rise/Fall';

  candleInterval = '1 minute';

  durationType = 'Ticks';
  durationValue = 1;

  stake = 0.5;

  purchaseType = 'Rise';

  // Undo/Redo stacks
  private historyStack: HistoryState[] = [];
  private currentIndex: number = -1;
  private maxHistorySize: number = 50;

  // Zoom level
  zoomLevel: number = 1;
  minZoom: number = 0.5;
  maxZoom: number = 2;
  zoomStep: number = 0.1;
  rightPanelCollapsed = false;

  isBlocksMenuOpen = false;

  toggleBlocksMenu() {
    this.isBlocksMenuOpen = !this.isBlocksMenuOpen;
  }

  sections = {
    tradeParams: false,
    purchaseConditions: false,
    sellConditions: false,
    restartConditions: false,
    analysis: false,
    utility: false,
    customFunctions: false,
  };

  bottomPanelCollapsed = false;
  activeTab = 'summary';
  growthRate = 1;
  takeProfit = 31;

  showUtilityPopup = false;
  selectedUtility: any = null;

  // Run once at start code blocks
  runOnceBlocks = [
    { variable: 'Sell by Count Down?', value: 'false', type: 'boolean' },
    { variable: 'MaxStakeTo', value: '10', type: 'number' },
    { variable: 'maxStake', value: '0', type: 'number' },
    { variable: 'tickCount', value: '10', type: 'number' },
    { variable: 'isBought', value: '1', type: 'number' },
    { variable: 'isSelling', value: '1', type: 'number' },
  ];

  // Trade statistics
  statistics = {
    totalStake: 0,
    totalPayout: 0,
    runs: 0,
    contractsLost: 0,
    contractsWon: 0,
    profitLoss: 0,
  };

  // Transactions and Journal
  transactions: any[] = [];
  journalEntries: any[] = [];

  showResetModal = false;
  showImportModal = false;
  showChartsModal = false;
  showTradingViewModal = false;

  chartHoverData: { x: number; y: number; price: string; volume: string; time: string } | null =
    null;

  // Import modal expanded sections
  importSections = {
    recent: true,
    local: true,
    googleDrive: false,
  };

  // ECharts options
  chartOption: EChartsOption = {
    title: {
      text: 'Volatility 25 Index',
      left: 'center',
      textStyle: { color: '#333', fontSize: 14 },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        if (params && params[0]) {
          const data = params[0];
          return `
            <div style="padding: 8px;">
              <div><strong>Time:</strong> ${data.axisValue}</div>
              <div><strong>Price:</strong> ${data.value}</div>
              <div><strong>Volume:</strong> ${Math.floor(Math.random() * 10000)}</div>
              <div><strong>High:</strong> ${(data.value * 1.002).toFixed(2)}</div>
              <div><strong>Low:</strong> ${(data.value * 0.998).toFixed(2)}</div>
            </div>
          `;
        }
        return '';
      },
    },
    xAxis: {
      type: 'category',
      data: [],
      axisLabel: { rotate: 45, fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      name: 'Price (AUD)',
      nameLocation: 'middle',
      nameGap: 40,
    },
    series: [
      {
        name: 'Price',
        type: 'line',
        data: [],
        smooth: true,
        lineStyle: { color: '#5470c6', width: 2 },
        areaStyle: { opacity: 0.1, color: '#5470c6' },
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: '#5470c6' },
      },
      {
        name: 'Volume',
        type: 'bar',
        yAxisIndex: 0,
        data: [],
        itemStyle: {
          color: '#91cc75',
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
    grid: {
      left: '8%',
      right: '8%',
      bottom: '10%',
      containLabel: true,
    },
    dataZoom: [
      { type: 'inside', start: 0, end: 100 },
      { type: 'slider', start: 0, end: 100, bottom: 10 },
    ],
    legend: {
      data: ['Price', 'Volume'],
      top: 30,
    },
  };

  constructor() {
    this.saveToHistory();
  }

  ngOnInit() {
    this.loadSavedData();
    this.generateMockChartData();
  }

  ngAfterViewInit() {
    this.applyZoom();
  }

  ngOnDestroy() {
    this.saveData();
  }

  // Generate mock chart data
  generateMockChartData() {
    const dates = [];
    const prices = [];
    const volumes = [];

    let basePrice = 3100;
    const now = new Date();

    for (let i = 0; i < 50; i++) {
      const date = new Date(now);
      date.setHours(date.getHours() - (50 - i));
      dates.push(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

      const change = (Math.random() - 0.5) * 15;
      basePrice += change;
      prices.push(Number(basePrice.toFixed(2)));
      volumes.push(Math.floor(Math.random() * 1000) + 500);
    }

    this.chartOption = {
      ...this.chartOption,
      xAxis: { type: 'category', data: dates, axisLabel: { rotate: 45, fontSize: 10 } },
      series: [
        { ...(this.chartOption.series as any[])[0], data: prices },
        { ...(this.chartOption.series as any[])[1], data: volumes },
      ],
    };
  }

  // ==================== UNDO/REDO LOGIC ====================

  saveToHistory() {
    if (this.currentIndex < this.historyStack.length - 1) {
      this.historyStack = this.historyStack.slice(0, this.currentIndex + 1);
    }

    const state: HistoryState = {
      sections: JSON.parse(JSON.stringify(this.sections)),
      growthRate: this.growthRate,
      takeProfit: this.takeProfit,
      runOnceCode: JSON.stringify(this.runOnceBlocks),
      tradeOptions: { growthRate: this.growthRate, takeProfit: this.takeProfit },
      timestamp: new Date(),
    };

    this.historyStack.push(state);

    if (this.historyStack.length > this.maxHistorySize) {
      this.historyStack.shift();
    } else {
      this.currentIndex = this.historyStack.length - 1;
    }
  }

  undo() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.restoreState(this.historyStack[this.currentIndex]);
      this.addJournalEntry(
        'Undo',
        `Restored state from ${this.historyStack[this.currentIndex].timestamp.toLocaleTimeString()}`,
      );
    } else {
      this.addJournalEntry('Undo', 'Nothing to undo', 'warning');
    }
  }

  redo() {
    if (this.currentIndex < this.historyStack.length - 1) {
      this.currentIndex++;
      this.restoreState(this.historyStack[this.currentIndex]);
      this.addJournalEntry(
        'Redo',
        `Restored state from ${this.historyStack[this.currentIndex].timestamp.toLocaleTimeString()}`,
      );
    } else {
      this.addJournalEntry('Redo', 'Nothing to redo', 'warning');
    }
  }

  restoreState(state: HistoryState) {
    this.sections = JSON.parse(JSON.stringify(state.sections));
    this.growthRate = state.growthRate;
    this.takeProfit = state.takeProfit;
    this.runOnceBlocks = JSON.parse(state.runOnceCode);
  }

  // ==================== ZOOM LOGIC ====================

  zoomIn() {
    if (this.zoomLevel < this.maxZoom) {
      this.zoomLevel += this.zoomStep;
      this.applyZoom();
      this.addJournalEntry('Zoom', `Zoomed in to ${(this.zoomLevel * 100).toFixed(0)}%`);
    }
  }

  zoomOut() {
    if (this.zoomLevel > this.minZoom) {
      this.zoomLevel -= this.zoomStep;
      this.applyZoom();
      this.addJournalEntry('Zoom', `Zoomed out to ${(this.zoomLevel * 100).toFixed(0)}%`);
    }
  }

  applyZoom() {
    if (this.canvasArea) {
      this.canvasArea.nativeElement.style.transform = `scale(${this.zoomLevel})`;
      this.canvasArea.nativeElement.style.transformOrigin = 'top left';
      this.canvasArea.nativeElement.style.transition = 'transform 0.3s ease';
    }
  }

  resetZoom() {
    this.zoomLevel = 1;
    this.applyZoom();
  }

  // ==================== SAVE/LOAD LOGIC ====================

  save() {
    const saveData = {
      sections: this.sections,
      growthRate: this.growthRate,
      takeProfit: this.takeProfit,
      runOnceBlocks: this.runOnceBlocks,
      statistics: this.statistics,
      transactions: this.transactions,
      journalEntries: this.journalEntries,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem('botBuilderData', JSON.stringify(saveData));
    this.addJournalEntry('Save', 'Bot configuration saved successfully', 'success');
    this.showNotification('Bot saved successfully!', 'success');
  }

  loadSavedData() {
    const savedData = localStorage.getItem('botBuilderData');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        this.sections = data.sections || this.sections;
        this.growthRate = data.growthRate || this.growthRate;
        this.takeProfit = data.takeProfit || this.takeProfit;
        this.runOnceBlocks = data.runOnceBlocks || this.runOnceBlocks;
        this.statistics = data.statistics || this.statistics;
        this.transactions = data.transactions || [];
        this.journalEntries = data.journalEntries || [];
        this.addJournalEntry('Load', 'Saved bot configuration loaded');
      } catch (e) {
        console.error('Error loading saved data:', e);
      }
    }
  }

  saveData() {
    this.save();
  }

  // ==================== RESET LOGIC ====================

  openResetModal() {
    this.showResetModal = true;
  }

  closeResetModal(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.showResetModal = false;
    }
  }

  confirmReset() {
    this.sections = {
      tradeParams: false,
      purchaseConditions: false,
      sellConditions: false,
      restartConditions: false,
      analysis: false,
      utility: false,
      customFunctions: false,
    };
    this.growthRate = 1;
    this.takeProfit = 31;
    this.runOnceBlocks = [
      { variable: 'Sell by Count Down?', value: 'false', type: 'boolean' },
      { variable: 'MaxStakeTo', value: '10', type: 'number' },
      { variable: 'maxStake', value: '0', type: 'number' },
      { variable: 'tickCount', value: '10', type: 'number' },
      { variable: 'isBought', value: '1', type: 'number' },
      { variable: 'isSelling', value: '1', type: 'number' },
    ];
    this.statistics = {
      totalStake: 0,
      totalPayout: 0,
      runs: 0,
      contractsLost: 0,
      contractsWon: 0,
      profitLoss: 0,
    };
    this.transactions = [];
    this.journalEntries = [];
    this.bottomPanelCollapsed = false;
    this.activeTab = 'summary';
    this.resetZoom();

    this.saveToHistory();
    this.showResetModal = false;
    this.addJournalEntry('Reset', 'All bot settings have been reset', 'warning');
    this.showNotification('Bot has been reset', 'info');
  }

  // ==================== IMPORT/EXPORT LOGIC ====================

  openImportModal() {
    this.showImportModal = true;
  }

  closeImportModal(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.showImportModal = false;
    }
  }

  toggleImportSection(section: string) {
    (this.importSections as any)[section] = !(this.importSections as any)[section];
  }

  importStrategy(strategyName: string) {
    this.addJournalEntry('Import', `Imported strategy: ${strategyName}`);
    this.showImportModal = false;
    this.showNotification(`Strategy "${strategyName}" imported successfully!`, 'success');
  }

  // ==================== CHART LOGIC ====================

  openChartsModal() {
    this.showChartsModal = true;
    setTimeout(() => {
      this.generateMockChartData();
    }, 100);
  }

  closeChartsModal(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.showChartsModal = false;
    }
  }

  onChartHover(event: MouseEvent) {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.chartHoverData = {
      x: event.clientX - rect.left + 10,
      y: event.clientY - rect.top - 30,
      price: (Math.random() * 1000 + 3000).toFixed(2),
      volume: Math.floor(Math.random() * 10000).toString(),
      time: new Date().toLocaleTimeString(),
    };
  }

  // ==================== TRADINGVIEW CHART LOGIC ====================

  openTradingViewModal() {
    this.showTradingViewModal = true;
  }

  closeTradingViewModal(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.showTradingViewModal = false;
    }
  }

  // ==================== UTILITY FUNCTIONS ====================

  toggleSection(section: keyof typeof this.sections) {
    this.sections[section] = !this.sections[section];
    this.saveToHistory();
  }

  toggleBottomPanel() {
    this.bottomPanelCollapsed = !this.bottomPanelCollapsed;
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  updateRunOnceBlock(index: number, field: string, value: any) {
    this.runOnceBlocks[index][field as keyof (typeof this.runOnceBlocks)[0]] = value;
    this.saveToHistory();
  }

  addRunOnceBlock() {
    this.runOnceBlocks.push({ variable: 'newVariable', value: '0', type: 'number' });
    this.saveToHistory();
  }

  removeRunOnceBlock(index: number) {
    this.runOnceBlocks.splice(index, 1);
    this.saveToHistory();
  }

  addJournalEntry(
    action: string,
    details: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
  ) {
    this.journalEntries.unshift({
      id: Date.now(),
      action,
      details,
      type,
      timestamp: new Date(),
    });

    if (this.journalEntries.length > 100) {
      this.journalEntries.pop();
    }
  }

  showNotification(message: string, type: 'success' | 'error' | 'info' | 'warning') {
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 z-50 px-4 py-2 rounded shadow-lg text-white ${
      type === 'success'
        ? 'bg-green-500'
        : type === 'error'
          ? 'bg-red-500'
          : type === 'warning'
            ? 'bg-yellow-500'
            : 'bg-blue-500'
    } transition-opacity duration-300`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  getJournalIcon(type: string): string {
    switch (type) {
      case 'success':
        return 'fa-solid fa-check-circle text-green-500';
      case 'error':
        return 'fa-solid fa-exclamation-circle text-red-500';
      case 'warning':
        return 'fa-solid fa-triangle-exclamation text-yellow-500';
      default:
        return 'fa-solid fa-info-circle text-blue-500';
    }
  }

  toggleRightPanel() {
    this.rightPanelCollapsed = !this.rightPanelCollapsed;
  }

  utilityOptions = [
    {
      name: 'Functions',
      icon: 'fa-solid fa-code',
      details:
        'This block creates a function, which is a group of instructions that can be executed at any time. Place other blocks in here to perform any kind of action that you need in your strategy. When all the instructions in a function have been carried out, your bot will continue with the remaining blocks in your strategy. Click the “do something” field to give it a name of your choice. Click the plus icon to send a value (as a named variable) to your function.',
      tagIcon: 'fa-solid fa-question',
      plusIcon: 'fa-solid fa-plus',
    },

    {
      name: 'Variables',
      icon: 'fa-solid fa fa-cube',
      details:
        "Variables allow you to store and manipulate data throughout your bot's execution. Supported types: number, string, boolean, array, object.",
    },
    {
      name: 'Notifications',
      icon: 'fa-solid fa-bell',
      description: 'Set up alerts and notifications',
      details:
        'Configure email, SMS, or webhook notifications for specific events like trade execution, profit targets, or errors.',
    },
    {
      name: 'Time',
      icon: 'fa-solid fa-clock',
      description: 'Time-based conditions and delays',
      details:
        'Schedule actions at specific times, set delays between trades, or execute based on market hours.',
    },
    {
      name: 'Math',
      icon: 'fa-solid fa-calculator',
      description: 'Mathematical operations and formulas',
      details:
        'Perform calculations, use mathematical functions (sin, cos, sqrt, etc.), and create custom formulas.',
    },
    {
      name: 'Test',
      icon: 'fa-solid fa-flask',
      description: 'Testing and debugging tools',
      details:
        'Run simulations, backtest strategies, and debug your bot with built-in testing tools.',
    },
    {
      name: 'Logic',
      icon: 'fa-solid fa-code-branch',
      description: 'Conditional logic and operators',
      details:
        'Use if/else statements, switch cases, logical operators (AND, OR, NOT), and comparison operators.',
    },
    {
      name: 'Lists',
      icon: 'fa-solid fa-list',
      description: 'Array and list operations',
      details:
        'Create and manipulate arrays, sort, filter, map, reduce, and iterate through lists.',
    },
    {
      name: 'Loops',
      icon: 'fa-solid fa-rotate-right',
      description: 'Iteration and loop structures',
      details:
        'Use for loops, while loops, do-while loops, and loop control statements (break, continue).',
    },
    {
      name: 'Miscellaneous',
      icon: 'fa-solid fa-ellipsis-h',
      description: 'Additional utilities and helpers',
      details: 'String manipulation, date formatting, data conversion, and other helper functions.',
    },
  ];

  // Add these methods
  toggleUtilitySection() {
    this.sections.utility = !this.sections.utility;
    this.saveToHistory();
  }

  openUtilityPopup(option: any) {
    this.selectedUtility = option;
    this.showUtilityPopup = true;
  }

  closeUtilityPopup(event?: MouseEvent) {
    if (!event || event.target === event.currentTarget) {
      this.showUtilityPopup = false;
      this.selectedUtility = null;
    }
  }
}
