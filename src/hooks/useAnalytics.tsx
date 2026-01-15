import { useMemo } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ProjectStatus } from '@/types/database';

export function useAnalytics() {
  const { projects, isLoading } = useProjects();

  const analytics = useMemo(() => {
    if (!projects.length) {
      return {
        projectsByMonth: [],
        revenueByMonth: [],
        statusDistribution: [],
        totalRevenue: 0,
        averageRevenue: 0,
        highestProject: null,
        currentMonthProjects: 0,
        currentMonthRevenue: 0,
      };
    }

    const now = new Date();
    const months = Array.from({ length: 12 }, (_, i) => {
      const date = subMonths(now, 11 - i);
      return {
        date,
        label: format(date, 'MMM', { locale: ptBR }),
        fullLabel: format(date, 'MMMM yyyy', { locale: ptBR }),
      };
    });

    // Projects by month
    const projectsByMonth = months.map(({ date, label, fullLabel }) => {
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      const count = projects.filter((p) => {
        const createdAt = parseISO(p.created_at);
        return isWithinInterval(createdAt, { start, end });
      }).length;
      return { month: label, fullMonth: fullLabel, count };
    });

    // Revenue by month
    const revenueByMonth = months.map(({ date, label, fullLabel }) => {
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      const revenue = projects
        .filter((p) => {
          const createdAt = parseISO(p.created_at);
          return isWithinInterval(createdAt, { start, end });
        })
        .reduce((sum, p) => sum + (p.budget_value || 0), 0);
      return { month: label, fullMonth: fullLabel, revenue };
    });

    // Status distribution
    const statusCounts: Record<ProjectStatus, number> = {
      em_conversa: 0,
      em_desenvolvimento: 0,
      concluido: 0,
      pausado: 0,
    };
    projects.forEach((p) => {
      statusCounts[p.status]++;
    });
    const statusDistribution = [
      { status: 'Em Conversa', count: statusCounts.em_conversa, color: 'hsl(217, 91%, 60%)' },
      { status: 'Em Desenvolvimento', count: statusCounts.em_desenvolvimento, color: 'hsl(38, 92%, 50%)' },
      { status: 'Concluído', count: statusCounts.concluido, color: 'hsl(160, 84%, 39%)' },
      { status: 'Pausado', count: statusCounts.pausado, color: 'hsl(0, 0%, 45%)' },
    ];

    // Totals
    const totalRevenue = projects.reduce((sum, p) => sum + (p.budget_value || 0), 0);
    const projectsWithBudget = projects.filter((p) => p.budget_value && p.budget_value > 0);
    const averageRevenue = projectsWithBudget.length > 0 
      ? totalRevenue / projectsWithBudget.length 
      : 0;

    // Highest project
    const highestProject = projects.reduce((highest, p) => {
      if (!highest || (p.budget_value || 0) > (highest.budget_value || 0)) {
        return p;
      }
      return highest;
    }, projects[0] || null);

    // Current month stats
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const currentMonthProjects = projects.filter((p) => {
      const createdAt = parseISO(p.created_at);
      return isWithinInterval(createdAt, { start: currentMonthStart, end: currentMonthEnd });
    });
    const currentMonthRevenue = currentMonthProjects.reduce((sum, p) => sum + (p.budget_value || 0), 0);

    return {
      projectsByMonth,
      revenueByMonth,
      statusDistribution,
      totalRevenue,
      averageRevenue,
      highestProject,
      currentMonthProjects: currentMonthProjects.length,
      currentMonthRevenue,
    };
  }, [projects]);

  return { ...analytics, isLoading };
}
