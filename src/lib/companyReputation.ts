import { db } from '@/lib/db';

export interface CompanyReputation {
  companyId: string;
  companyName: string;
  overallScore: number;
  totalComplaints: number;
  resolvedComplaints: number;
  pendingComplaints: number;
  averageResolutionTime: number;
  responseRate: number;
  satisfactionScore: number;
  lastUpdated: string;
  trend: 'improving' | 'stable' | 'declining';
  badges: string[];
  categoryRanking?: {
    category: string;
    rank: number;
    totalCompanies: number;
  }[];
}

export interface ReputationMetrics {
  resolutionRate: number;
  averageResponseTime: number;
  customerSatisfaction: number;
  complaintVolume: number;
  repeatComplaintRate: number;
  transparencyScore: number;
}

export class CompanyReputationService {
  
  async calculateCompanyReputation(companyId: string): Promise<CompanyReputation> {
    try {
      // Get company details
      const company = await db.company.findUnique({
        where: { id: companyId }
      });

      if (!company) {
        throw new Error('Company not found');
      }

      // Get all complaints for this company
      const complaints = await db.complaint.findMany({
        where: { companyId },
        include: {
          updates: {
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      // Calculate metrics
      const totalComplaints = complaints.length;
      const resolvedComplaints = complaints.filter(c => c.status === 'RESOLVED').length;
      const pendingComplaints = totalComplaints - resolvedComplaints;

      // Calculate resolution time
      const resolutionTimes = complaints
        .filter(c => c.status === 'RESOLVED' && c.resolvedAt)
        .map(c => {
          const created = new Date(c.createdAt).getTime();
          const resolved = new Date(c.resolvedAt!).getTime();
          return (resolved - created) / (1000 * 60 * 60 * 24); // days
        });

      const averageResolutionTime = resolutionTimes.length > 0 
        ? resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length 
        : 0;

      // Calculate response rate (complaints with at least one update)
      const complaintsWithUpdates = complaints.filter(c => c.updates.length > 0).length;
      const responseRate = totalComplaints > 0 ? complaintsWithUpdates / totalComplaints : 0;

      // Calculate satisfaction score (based on resolution rate and speed)
      const resolutionRate = totalComplaints > 0 ? resolvedComplaints / totalComplaints : 0;
      const speedScore = averageResolutionTime > 0 ? Math.max(0, 100 - (averageResolutionTime * 2)) : 100;
      const satisfactionScore = (resolutionRate * 0.6 + speedScore * 0.4);

      // Calculate overall score
      const overallScore = this.calculateOverallScore({
        resolutionRate,
        averageResponseTime: averageResolutionTime,
        customerSatisfaction: satisfactionScore,
        complaintVolume: totalComplaints,
        repeatComplaintRate: 0, // TODO: Implement repeat complaint calculation
        transparencyScore: responseRate
      });

      // Determine trend
      const trend = this.calculateTrend(complaints);

      // Generate badges
      const badges = this.generateBadges(overallScore, resolutionRate, averageResolutionTime);

      // Get category rankings
      const categoryRanking = await this.getCategoryRanking(companyId, company.category);

      return {
        companyId,
        companyName: company.name,
        overallScore: Math.round(overallScore),
        totalComplaints,
        resolvedComplaints,
        pendingComplaints,
        averageResolutionTime: Math.round(averageResolutionTime),
        responseRate: Math.round(responseRate * 100),
        satisfactionScore: Math.round(satisfactionScore),
        lastUpdated: new Date().toISOString(),
        trend,
        badges,
        categoryRanking
      };
    } catch (error) {
      console.error('Error calculating company reputation:', error);
      throw error;
    }
  }

  private calculateOverallScore(metrics: ReputationMetrics): number {
    const weights = {
      resolutionRate: 0.35,
      averageResponseTime: 0.25,
      customerSatisfaction: 0.20,
      complaintVolume: 0.10,
      repeatComplaintRate: 0.05,
      transparencyScore: 0.05
    };

    // Normalize metrics to 0-100 scale
    const normalizedMetrics = {
      resolutionRate: metrics.resolutionRate * 100,
      averageResponseTime: Math.max(0, 100 - (metrics.averageResponseTime * 3)), // Penalize slow response
      customerSatisfaction: metrics.customerSatisfaction,
      complaintVolume: Math.max(0, 100 - Math.min(metrics.complaintVolume * 2, 100)), // Penalize high volume
      repeatComplaintRate: Math.max(0, 100 - (metrics.repeatComplaintRate * 100)), // Penalize repeat complaints
      transparencyScore: metrics.transparencyScore * 100
    };

    const weightedScore = 
      normalizedMetrics.resolutionRate * weights.resolutionRate +
      normalizedMetrics.averageResponseTime * weights.averageResponseTime +
      normalizedMetrics.customerSatisfaction * weights.customerSatisfaction +
      normalizedMetrics.complaintVolume * weights.complaintVolume +
      normalizedMetrics.repeatComplaintRate * weights.repeatComplaintRate +
      normalizedMetrics.transparencyScore * weights.transparencyScore;

    return Math.min(100, Math.max(0, weightedScore));
  }

  private calculateTrend(complaints: any[]): 'improving' | 'stable' | 'declining' {
    if (complaints.length < 5) return 'stable';

    // Get complaints from last 30 days vs previous 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentComplaints = complaints.filter(c => new Date(c.createdAt) >= thirtyDaysAgo);
    const olderComplaints = complaints.filter(c => {
      const created = new Date(c.createdAt);
      return created >= sixtyDaysAgo && created < thirtyDaysAgo;
    });

    const recentResolutionRate = recentComplaints.length > 0 
      ? recentComplaints.filter(c => c.status === 'RESOLVED').length / recentComplaints.length 
      : 0;

    const olderResolutionRate = olderComplaints.length > 0 
      ? olderComplaints.filter(c => c.status === 'RESOLVED').length / olderComplaints.length 
      : 0;

    const difference = recentResolutionRate - olderResolutionRate;

    if (difference > 0.05) return 'improving';
    if (difference < -0.05) return 'declining';
    return 'stable';
  }

  private generateBadges(overallScore: number, resolutionRate: number, avgResolutionTime: number): string[] {
    const badges: string[] = [];

    if (overallScore >= 90) badges.push('Excelente');
    else if (overallScore >= 75) badges.push('Bom');
    else if (overallScore >= 60) badges.push('Regular');

    if (resolutionRate >= 0.9) badges.push('Resolutivo');
    if (avgResolutionTime <= 7) badges.push('Rápido');
    if (avgResolutionTime <= 3) badges.push('Muito Rápido');

    return badges;
  }

  private async getCategoryRanking(companyId: string, category: string) {
    try {
      // Get all companies in the same category
      const categoryCompanies = await db.company.findMany({
        where: { category },
        include: {
          complaints: {
            where: {
              createdAt: {
                gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
              }
            }
          }
        }
      });

      // Calculate scores for all companies in category
      const companyScores = await Promise.all(
        categoryCompanies.map(async (company) => {
          const resolved = company.complaints.filter(c => c.status === 'RESOLVED').length;
          const total = company.complaints.length;
          const resolutionRate = total > 0 ? resolved / total : 0;
          
          return {
            companyId: company.id,
            score: resolutionRate * 100,
            totalComplaints: total
          };
        })
      );

      // Sort by score (descending)
      companyScores.sort((a, b) => b.score - a.score);

      // Find current company's rank
      const rank = companyScores.findIndex(c => c.companyId === companyId) + 1;
      const totalCompanies = companyScores.length;

      if (rank > 0 && totalCompanies > 1) {
        return [{
          category,
          rank,
          totalCompanies
        }];
      }

      return undefined;
    } catch (error) {
      console.error('Error calculating category ranking:', error);
      return undefined;
    }
  }

  async getTopCompanies(limit: number = 10, category?: string): Promise<CompanyReputation[]> {
    try {
      const whereClause: any = {};
      if (category) {
        whereClause.category = category;
      }

      const companies = await db.company.findMany({
        where: whereClause,
        include: {
          complaints: {
            include: {
              updates: {
                orderBy: { createdAt: 'desc' }
              }
            }
          }
        }
      });

      const reputations = await Promise.all(
        companies.map(company => this.calculateCompanyReputation(company.id))
      );

      // Sort by overall score and return top companies
      return reputations
        .sort((a, b) => b.overallScore - a.overallScore)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting top companies:', error);
      return [];
    }
  }

  async updateCompanyReputation(companyId: string): Promise<void> {
    try {
      const reputation = await this.calculateCompanyReputation(companyId);
      
      // Update or create reputation record
      await db.companyReputation.upsert({
        where: { companyId },
        update: {
          overallScore: reputation.overallScore,
          totalComplaints: reputation.totalComplaints,
          resolvedComplaints: reputation.resolvedComplaints,
          averageResolutionTime: reputation.averageResolutionTime,
          responseRate: reputation.responseRate,
          satisfactionScore: reputation.satisfactionScore,
          trend: reputation.trend,
          badges: JSON.stringify(reputation.badges),
          categoryRanking: JSON.stringify(reputation.categoryRanking),
          lastUpdated: new Date()
        },
        create: {
          companyId,
          overallScore: reputation.overallScore,
          totalComplaints: reputation.totalComplaints,
          resolvedComplaints: reputation.resolvedComplaints,
          averageResolutionTime: reputation.averageResolutionTime,
          responseRate: reputation.responseRate,
          satisfactionScore: reputation.satisfactionScore,
          trend: reputation.trend,
          badges: JSON.stringify(reputation.badges),
          categoryRanking: JSON.stringify(reputation.categoryRanking)
        }
      });
    } catch (error) {
      console.error('Error updating company reputation:', error);
      throw error;
    }
  }

  async getReputationHistory(companyId: string, days: number = 90): Promise<any[]> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const history = await db.reputationHistory.findMany({
        where: {
          companyId,
          date: {
            gte: startDate
          }
        },
        orderBy: { date: 'asc' }
      });

      return history.map(record => ({
        date: record.date.toISOString().split('T')[0],
        score: record.score,
        totalComplaints: record.totalComplaints,
        resolvedComplaints: record.resolvedComplaints
      }));
    } catch (error) {
      console.error('Error getting reputation history:', error);
      return [];
    }
  }
}

export const companyReputationService = new CompanyReputationService();