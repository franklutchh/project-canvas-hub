import { AppLayout } from '@/components/layout/AppLayout';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, DollarSign, Briefcase, Calendar, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Analytics() {
  const {
    projectsByMonth,
    revenueByMonth,
    statusDistribution,
    totalRevenue,
    averageRevenue,
    highestProject,
    currentMonthProjects,
    currentMonthRevenue,
    isLoading,
  } = useAnalytics();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-8">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  const stats = [
    {
      title: 'Faturamento Total',
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Média por Projeto',
      value: formatCurrency(averageRevenue),
      icon: TrendingUp,
      gradient: 'from-blue-500 to-cyan-600',
    },
    {
      title: 'Projetos este Mês',
      value: currentMonthProjects.toString(),
      icon: Calendar,
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      title: 'Receita este Mês',
      value: formatCurrency(currentMonthRevenue),
      icon: Briefcase,
      gradient: 'from-purple-500 to-pink-600',
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Analytics</h1>
            <Sparkles className="h-5 w-5 text-primary animate-pulse-glow" />
          </div>
          <p className="text-muted-foreground">Visão geral do desempenho dos seus projetos</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={stat.title} className="glass-card hover-lift group" style={{ animationDelay: `${index * 100}ms` }}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg group-hover:shadow-glow transition-shadow`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Highest Project */}
        {highestProject && highestProject.budget_value && (
          <Card className="glass-card border-primary/20 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Maior Projeto</p>
                  <p className="text-lg font-semibold">{highestProject.name}</p>
                  <p className="text-sm text-muted-foreground">{highestProject.client_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold gradient-premium">
                    {formatCurrency(highestProject.budget_value)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Projetos por Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectsByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(225 12% 20%)" />
                    <XAxis dataKey="month" stroke="hsl(225 10% 50%)" fontSize={12} />
                    <YAxis stroke="hsl(225 10% 50%)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(225 15% 8%)',
                        border: '1px solid hsl(225 12% 20%)',
                        borderRadius: '12px',
                        backdropFilter: 'blur(20px)',
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(265 85% 60%)" radius={[6, 6, 0, 0]} name="Projetos" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Faturamento Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(225 12% 20%)" />
                    <XAxis dataKey="month" stroke="hsl(225 10% 50%)" fontSize={12} />
                    <YAxis stroke="hsl(225 10% 50%)" fontSize={12} tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(225 15% 8%)',
                        border: '1px solid hsl(225 12% 20%)',
                        borderRadius: '12px',
                      }}
                      formatter={(value: number) => [formatCurrency(value), 'Receita']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(160 84% 39%)" fill="hsl(160 84% 39% / 0.2)" name="Receita" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Distribuição por Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistribution.filter((s) => s.count > 0)}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="count"
                      nameKey="status"
                      label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(225 15% 8%)', border: '1px solid hsl(225 12% 20%)', borderRadius: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
