import { useState, useRef } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Upload, Save, Mail, Building2, Phone, CreditCard, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Settings() {
  const { user } = useAuth();
  const { profile, isLoading, updateProfile, uploadAvatar } = useUserProfile();
  
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state with profile data
  useState(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setCompanyName(profile.company_name || '');
      setPhone(profile.phone || '');
      setDefaultPaymentMethod(profile.default_payment_method || '');
    }
  });

  // Update state when profile loads
  if (profile && !fullName && profile.full_name) {
    setFullName(profile.full_name);
  }
  if (profile && !companyName && profile.company_name) {
    setCompanyName(profile.company_name);
  }
  if (profile && !phone && profile.phone) {
    setPhone(profile.phone);
  }
  if (profile && !defaultPaymentMethod && profile.default_payment_method) {
    setDefaultPaymentMethod(profile.default_payment_method);
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const avatarUrl = await uploadAvatar(file);
    if (avatarUrl) {
      await updateProfile.mutateAsync({ avatar_url: avatarUrl + `?t=${Date.now()}` });
    }
    setIsUploading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await updateProfile.mutateAsync({
      full_name: fullName || null,
      company_name: companyName || null,
      phone: phone || null,
      default_payment_method: defaultPaymentMethod || null,
    });
    setIsSaving(false);
  };

  const getInitials = () => {
    if (fullName) {
      return fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Configurações</h1>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Configurações</h1>
            <Sparkles className="h-5 w-5 text-primary animate-pulse-glow" />
          </div>
          <p className="text-muted-foreground">Gerencie seu perfil e preferências</p>
        </div>

        {/* Profile Card */}
        <Card className="glass-card overflow-hidden">
          {/* Top accent gradient */}
          <div className="h-24 bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card" />
          </div>
          
          <CardHeader className="-mt-12 relative z-10">
            <div className="flex items-end gap-4">
              {/* Avatar with glow */}
              <div className="relative group">
                <Avatar className="h-24 w-24 ring-4 ring-background shadow-premium">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-purple-600 text-white font-bold">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <User className="h-5 w-5 text-primary" />
                  Perfil
                </CardTitle>
                <CardDescription>Informações do seu perfil pessoal</CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex items-center gap-4">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="rounded-xl"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? 'Enviando...' : 'Alterar Foto'}
              </Button>
              <p className="text-sm text-muted-foreground">JPG, PNG. Máximo 2MB.</p>
            </div>

            {/* Form Fields */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="pl-11"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="pl-11"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-sm font-medium">Nome da Empresa</Label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Sua empresa"
                  className="pl-11"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences Card */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Preferências
            </CardTitle>
            <CardDescription>Configurações padrão para novos projetos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paymentMethod" className="text-sm font-medium">Método de Pagamento Padrão</Label>
              <Select value={defaultPaymentMethod} onValueChange={setDefaultPaymentMethod}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Selecione um método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="transferencia">Transferência Bancária</SelectItem>
                  <SelectItem value="cartao">Cartão de Crédito</SelectItem>
                  <SelectItem value="boleto">Boleto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Account Card */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Conta
            </CardTitle>
            <CardDescription>Informações da sua conta</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button 
          onClick={handleSave} 
          disabled={isSaving} 
          className="w-full h-12 text-base font-medium rounded-xl"
        >
          <Save className="h-5 w-5 mr-2" />
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </AppLayout>
  );
}
