/**
 * 💾 Tick Storage System - Real-time price data persistence
 * Stores ticks for Gold, USD, and correlation analysis
 */

import { createClient } from '@supabase/supabase-js';
import { PriceData } from '../websocket/WebSocketManager';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface TickRecord {
  symbol: string;
  price: number;
  bid?: number;
  ask?: number;
  volume?: number;
  source: string;
  tick_time: string;
}

interface CorrelationRecord {
  gold_price: number;
  usd_index: number;
  correlation_1m: number;
  strength: string;
  tick_time: string;
}

export class TickStorage {
  private batchBuffer: TickRecord[] = [];
  private correlationBuffer: CorrelationRecord[] = [];
  private readonly BATCH_SIZE = 50;
  private readonly BATCH_INTERVAL = 5000; // 5 seconds
  
  constructor() {
    // Auto-flush batches periodically
    setInterval(() => this.flushBatches(), this.BATCH_INTERVAL);
  }

  /**
   * 📊 Store individual price tick
   */
  async storeTick(priceData: PriceData): Promise<void> {
    const tickRecord: TickRecord = {
      symbol: priceData.symbol,
      price: priceData.price,
      bid: priceData.bid,
      ask: priceData.ask,
      volume: priceData.volume,
      source: priceData.source,
      tick_time: new Date(priceData.timestamp).toISOString(),
    };

    // Add to batch buffer
    this.batchBuffer.push(tickRecord);

    // Flush if batch is full
    if (this.batchBuffer.length >= this.BATCH_SIZE) {
      await this.flushTickBatch();
    }
  }

  /**
   * 🔗 Store correlation data
   */
  async storeCorrelation(
    goldPrice: number,
    usdIndex: number, 
    correlation: number,
    strength: string
  ): Promise<void> {
    const correlationRecord: CorrelationRecord = {
      gold_price: goldPrice,
      usd_index: usdIndex,
      correlation_1m: correlation,
      strength,
      tick_time: new Date().toISOString(),
    };

    this.correlationBuffer.push(correlationRecord);

    // Flush correlation buffer (smaller batch size)
    if (this.correlationBuffer.length >= 10) {
      await this.flushCorrelationBatch();
    }
  }

  /**
   * 🚀 Batch insert ticks for performance
   */
  private async flushTickBatch(): Promise<void> {
    if (this.batchBuffer.length === 0) return;

    try {
      // Determine table based on symbols
      const goldTicks = this.batchBuffer.filter(tick => tick.symbol === 'XAU/USD');
      const usdTicks = this.batchBuffer.filter(tick => tick.symbol === 'DXY');
      const currencyTicks = this.batchBuffer.filter(tick => 
        ['EUR/USD', 'GBP/USD', 'USD/JPY', 'CAD/USD', 'SEK/USD', 'CHF/USD'].includes(tick.symbol)
      );

      // Insert to appropriate tables
      const promises: Promise<any>[] = [];

      if (goldTicks.length > 0) {
        promises.push(
          supabase.from('gold_ticks').insert(goldTicks.map(tick => ({
            price: tick.price,
            bid: tick.bid,
            ask: tick.ask,
            volume: tick.volume,
            source: tick.source,
            tick_time: tick.tick_time,
          })))
        );
      }

      if (usdTicks.length > 0) {
        promises.push(
          supabase.from('usd_ticks').insert(usdTicks.map(tick => ({
            dxy_price: tick.price,
            bid: tick.bid,
            ask: tick.ask,
            volume: tick.volume,
            source: tick.source,
            tick_time: tick.tick_time,
          })))
        );
      }

      if (currencyTicks.length > 0) {
        promises.push(
          supabase.from('currency_ticks').insert(currencyTicks.map(tick => ({
            pair: tick.symbol,
            price: tick.price,
            bid: tick.bid,
            ask: tick.ask,
            volume: tick.volume,
            weight: this.getCurrencyWeight(tick.symbol),
            source: tick.source,
            tick_time: tick.tick_time,
          })))
        );
      }

      await Promise.all(promises);
      console.log(`💾 Stored ${this.batchBuffer.length} ticks to database`);
      
      // Clear buffer
      this.batchBuffer = [];

    } catch (error) {
      console.error('❌ Tick storage error:', error);
      // Keep buffer for retry
    }
  }

  /**
   * 🔗 Batch insert correlations
   */
  private async flushCorrelationBatch(): Promise<void> {
    if (this.correlationBuffer.length === 0) return;

    try {
      const { error } = await supabase
        .from('gold_usd_correlation')
        .insert(this.correlationBuffer);

      if (error) throw error;

      console.log(`🔗 Stored ${this.correlationBuffer.length} correlation records`);
      this.correlationBuffer = [];

    } catch (error) {
      console.error('❌ Correlation storage error:', error);
    }
  }

  /**
   * 🚀 Flush all pending batches
   */
  async flushBatches(): Promise<void> {
    await Promise.all([
      this.flushTickBatch(),
      this.flushCorrelationBatch(),
    ]);
  }

  /**
   * 📊 Get recent ticks for analysis
   */
  async getRecentTicks(
    symbol: string, 
    minutes: number = 5
  ): Promise<TickRecord[]> {
    const tableName = this.getTableName(symbol);
    const sinceTime = new Date(Date.now() - minutes * 60 * 1000).toISOString();

    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .gte('tick_time', sinceTime)
        .order('tick_time', { ascending: false })
        .limit(1000);

      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('❌ Fetch recent ticks error:', error);
      return [];
    }
  }

  /**
   * 🔗 Get recent correlation data
   */
  async getRecentCorrelations(minutes: number = 60): Promise<CorrelationRecord[]> {
    const sinceTime = new Date(Date.now() - minutes * 60 * 1000).toISOString();

    try {
      const { data, error } = await supabase
        .from('gold_usd_correlation')
        .select('*')
        .gte('tick_time', sinceTime)
        .order('tick_time', { ascending: false })
        .limit(500);

      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('❌ Fetch correlations error:', error);
      return [];
    }
  }

  /**
   * 🧮 Helper: Get table name for symbol
   */
  private getTableName(symbol: string): string {
    if (symbol === 'XAU/USD') return 'gold_ticks';
    if (symbol === 'DXY') return 'usd_ticks';
    return 'currency_ticks';
  }

  /**
   * 🌍 Helper: Get DXY weight for currency pair
   */
  private getCurrencyWeight(pair: string): number {
    const weights: Record<string, number> = {
      'EUR/USD': 0.576,
      'JPY/USD': 0.136,
      'GBP/USD': 0.119,
      'CAD/USD': 0.091,
      'SEK/USD': 0.042,
      'CHF/USD': 0.036,
    };
    return weights[pair] || 0.001;
  }

  /**
   * 🧹 Cleanup old data (keep last 24 hours)
   */
  async cleanupOldData(): Promise<void> {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    try {
      await Promise.all([
        supabase.from('gold_ticks').delete().lt('tick_time', cutoffTime),
        supabase.from('usd_ticks').delete().lt('tick_time', cutoffTime),
        supabase.from('currency_ticks').delete().lt('tick_time', cutoffTime),
        supabase.from('gold_usd_correlation').delete().lt('tick_time', cutoffTime),
      ]);

      console.log('🧹 Cleaned up old tick data (>24h)');

    } catch (error) {
      console.error('❌ Cleanup error:', error);
    }
  }
}