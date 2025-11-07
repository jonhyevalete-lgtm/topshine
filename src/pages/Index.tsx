import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Users, TrendingUp, Sparkles, Star } from "lucide-react";
import logo from "@/assets/logo.png";

const Index = () => {
  return (
    <Layout>
      <div className="space-y-12">
        <section className="text-center space-y-6 py-12">
          <img src={logo} alt="TopShine Logo" className="h-32 w-auto mx-auto" />
          <h1 className="text-5xl md:text-6xl font-bold text-gold">
            TopShine
          </h1>
          <p className="text-xl text-gold/80 max-w-2xl mx-auto">
            Sistema profissional de gestão para o seu negócio de detalhe automóvel
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button asChild size="lg" className="bg-gold hover:bg-gold-dark text-premium">
              <Link to="/clientes">
                <Users className="mr-2 h-5 w-5" />
                Gerir Clientes
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-gold text-gold hover:bg-gold/10">
              <Link to="/admin">
                <TrendingUp className="mr-2 h-5 w-5" />
                Área Administrativa
              </Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <Card className="bg-card/50 backdrop-blur border-gold/20 hover:border-gold/40 transition-all">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-gold" />
              </div>
              <CardTitle className="text-gold">Três Tipos de Lavagem</CardTitle>
              <CardDescription className="text-muted-foreground">
                Lavagem Simples (€15), Simples+ (€30) e Pro (€75)
              </CardDescription>
            </CardHeader>
            <CardContent className="text-foreground">
              Ofereça diferentes níveis de serviço aos seus clientes com preços flexíveis.
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-gold/20 hover:border-gold/40 transition-all">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mb-4">
                <Star className="h-6 w-6 text-gold" />
              </div>
              <CardTitle className="text-gold">Programa Fidelidade</CardTitle>
              <CardDescription className="text-muted-foreground">
                A cada 9 lavagens, a 10ª é grátis
              </CardDescription>
            </CardHeader>
            <CardContent className="text-foreground">
              Sistema automático que recompensa os seus clientes mais fiéis.
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-gold/20 hover:border-gold/40 transition-all">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-gold" />
              </div>
              <CardTitle className="text-gold">Gestão Completa</CardTitle>
              <CardDescription className="text-muted-foreground">
                Controle gastos, ganhos e stock
              </CardDescription>
            </CardHeader>
            <CardContent className="text-foreground">
              Dashboard administrativo com visão completa do seu negócio.
            </CardContent>
          </Card>
        </section>

        <section className="bg-card/30 backdrop-blur border border-gold/20 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-gold mb-4">Pronto para começar?</h2>
          <p className="text-gold/70 mb-6 max-w-2xl mx-auto">
            Registe os seus clientes, adicione lavagens e acompanhe o crescimento do seu negócio com facilidade.
          </p>
          <Button asChild size="lg" className="bg-gold hover:bg-gold-dark text-premium">
            <Link to="/clientes">
              Começar Agora
            </Link>
          </Button>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
