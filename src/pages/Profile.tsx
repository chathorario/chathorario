import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useData } from "@/context/DataContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, School, Calendar, Shield, Palette } from "lucide-react";
import { ThemeSelector } from "@/components/ThemeSelector";

const Profile = () => {
    const { user } = useAuth();
    const { profile } = useProfile(user?.id);
    const { setHasUnsavedChanges } = useData();

    // Clear unsaved changes flag when this page loads
    useEffect(() => {
        setHasUnsavedChanges(false);
    }, [setHasUnsavedChanges]);

    const displayName = profile?.full_name || user?.email?.split('@')[0] || "Usuário";
    const initials = displayName.substring(0, 2).toUpperCase();

    return (
        <div className="w-full p-6">
            <h1 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100">Meu Perfil</h1>

            <div className="grid gap-6">
                {/* User Info Card */}
                <Card className="dark:bg-slate-800 dark:border-slate-700">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2 dark:text-slate-100">
                            <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            Informações Pessoais
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <Avatar className="h-24 w-24 border-4 border-slate-50 dark:border-slate-700">
                                <AvatarImage src={user?.user_metadata?.avatar_url} />
                                <AvatarFallback className="text-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>

                            <div className="space-y-4 flex-1">
                                <div className="grid gap-1">
                                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Nome Completo</label>
                                    <div className="text-lg font-medium text-slate-900 dark:text-slate-100">{displayName}</div>
                                </div>
                                <div className="grid gap-1">
                                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Email</label>
                                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                        <Mail className="h-4 w-4 text-slate-400" />
                                        {user?.email}
                                    </div>
                                </div>
                                <div className="grid gap-1">
                                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Função</label>
                                    <div>
                                        <Badge variant="secondary" className="capitalize dark:bg-slate-700 dark:text-slate-200">
                                            {profile?.role || "Usuário"}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Theme Settings Card */}
                <Card className="dark:bg-slate-800 dark:border-slate-700">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2 dark:text-slate-100">
                            <Palette className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            Aparência
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                Escolha o tema da aplicação
                            </label>
                            <ThemeSelector />
                        </div>
                    </CardContent>
                </Card>

                {/* School Info Card */}
                {profile?.school_name && (
                    <Card className="dark:bg-slate-800 dark:border-slate-700">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg flex items-center gap-2 dark:text-slate-100">
                                <School className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                Vínculo Escolar
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                    <School className="h-4 w-4" />
                                    Escola
                                </label>
                                <div className="font-medium text-slate-900 dark:text-slate-100">{profile.school_name}</div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    Responsável
                                </label>
                                <div className="font-medium text-slate-900 dark:text-slate-100">{profile.responsible || "Não informado"}</div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Ano Letivo
                                </label>
                                <div className="font-medium text-slate-900 dark:text-slate-100">{profile.academic_year || "Não informado"}</div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default Profile;
