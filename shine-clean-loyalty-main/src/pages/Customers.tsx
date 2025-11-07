import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Car, Sparkles } from "lucide-react";

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [newCustomer, setNewCustomer] = useState({ licensePlate: "", name: "", phone: "" });
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [washType, setWashType] = useState<string>("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isWashDialogOpen, setIsWashDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const addCustomerMutation = useMutation({
    mutationFn: async (customer: typeof newCustomer) => {
      const { data, error } = await supabase
        .from("customers")
        .insert([{
          license_plate: customer.licensePlate.toUpperCase(),
          name: customer.name,
          phone: customer.phone,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setNewCustomer({ licensePlate: "", name: "", phone: "" });
      setIsAddDialogOpen(false);
      toast({ title: "Cliente adicionado com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao adicionar cliente", variant: "destructive" });
    },
  });

  const addWashMutation = useMutation({
    mutationFn: async ({ customerId, washType }: { customerId: string; washType: string }) => {
      const customer = customers.find(c => c.id === customerId);
      if (!customer) throw new Error("Cliente não encontrado");

      const prices = {
        simples: 15,
        simples_plus: 30,
        pro: 75,
      };

      const isFree = customer.total_washes > 0 && (customer.total_washes % 9 === 0);
      const price = isFree ? 0 : prices[washType as keyof typeof prices];

      const { error: washError } = await supabase.from("washes").insert([{
        customer_id: customerId,
        wash_type: isFree ? "gratuita" : washType,
        price,
        is_free: isFree,
      }]);

      if (washError) throw washError;

      const newTotalWashes = customer.total_washes + 1;
      const newFreeWashes = isFree ? customer.free_washes_earned + 1 : customer.free_washes_earned;

      const { error: updateError } = await supabase
        .from("customers")
        .update({
          total_washes: newTotalWashes,
          free_washes_earned: newFreeWashes,
        })
        .eq("id", customerId);

      if (updateError) throw updateError;

      if (!isFree) {
        await supabase.from("revenue").insert([{
          description: `Lavagem ${washType} - ${customer.license_plate}`,
          amount: price,
        }]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setIsWashDialogOpen(false);
      setWashType("");
      toast({ title: "Lavagem registada com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao registar lavagem", variant: "destructive" });
    },
  });

  const filteredCustomers = customers.filter((customer) =>
    customer.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gold">Gestão de Clientes</h1>
            <p className="text-gold/70 mt-2">Adicione e gerencie clientes e lavagens</p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gold hover:bg-gold-dark text-premium">
                <UserPlus className="mr-2 h-4 w-4" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-gold/20">
              <DialogHeader>
                <DialogTitle className="text-gold">Adicionar Novo Cliente</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Preencha os dados do cliente
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="licensePlate">Matrícula</Label>
                  <Input
                    id="licensePlate"
                    value={newCustomer.licensePlate}
                    onChange={(e) => setNewCustomer({ ...newCustomer, licensePlate: e.target.value })}
                    placeholder="AA-00-BB"
                    className="border-gold/20"
                  />
                </div>
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    placeholder="Nome completo"
                    className="border-gold/20"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telemóvel</Label>
                  <Input
                    id="phone"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    placeholder="+351 900 000 000"
                    className="border-gold/20"
                  />
                </div>
                <Button
                  onClick={() => addCustomerMutation.mutate(newCustomer)}
                  className="w-full bg-gold hover:bg-gold-dark text-premium"
                  disabled={!newCustomer.licensePlate || !newCustomer.name || !newCustomer.phone}
                >
                  Adicionar Cliente
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Input
            placeholder="Pesquisar por matrícula ou nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-card border-gold/20 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCustomers.map((customer) => {
            const nextWashFree = (customer.total_washes + 1) % 9 === 0;
            const washesUntilFree = 9 - (customer.total_washes % 9);
            
            return (
              <Card key={customer.id} className="bg-card/50 backdrop-blur border-gold/20">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-gold flex items-center gap-2">
                        <Car className="h-5 w-5" />
                        {customer.license_plate}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground mt-1">
                        {customer.name}
                      </CardDescription>
                    </div>
                    {nextWashFree && (
                      <span className="text-xs bg-gold text-premium px-2 py-1 rounded-full font-semibold">
                        Próxima Grátis!
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-1">
                    <p className="text-foreground"><span className="text-gold">Telemóvel:</span> {customer.phone}</p>
                    <p className="text-foreground"><span className="text-gold">Total de lavagens:</span> {customer.total_washes}</p>
                    <p className="text-foreground"><span className="text-gold">Lavagens grátis:</span> {customer.free_washes_earned}</p>
                    {!nextWashFree && (
                      <p className="text-sm text-muted-foreground">
                        Faltam {washesUntilFree} lavagens para a próxima grátis
                      </p>
                    )}
                  </div>
                  
                  <Dialog open={isWashDialogOpen && selectedCustomerId === customer.id} onOpenChange={(open) => {
                    setIsWashDialogOpen(open);
                    if (!open) {
                      setSelectedCustomerId(null);
                      setWashType("");
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full bg-gold hover:bg-gold-dark text-premium"
                        onClick={() => setSelectedCustomerId(customer.id)}
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Adicionar Lavagem
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-gold/20">
                      <DialogHeader>
                        <DialogTitle className="text-gold">Adicionar Lavagem</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                          {customer.license_plate} - {customer.name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        {nextWashFree && (
                          <div className="bg-gold/10 border border-gold/20 rounded-lg p-4 text-center">
                            <p className="text-gold font-semibold">🎉 Esta lavagem é GRÁTIS!</p>
                          </div>
                        )}
                        <div>
                          <Label htmlFor="washType">Tipo de Lavagem</Label>
                          <Select value={washType} onValueChange={setWashType}>
                            <SelectTrigger className="border-gold/20">
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="simples">Lavagem Simples - €15</SelectItem>
                              <SelectItem value="simples_plus">Lavagem Simples+ - €30</SelectItem>
                              <SelectItem value="pro">Lavagem Pro - €75</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          onClick={() => {
                            if (selectedCustomerId && washType) {
                              addWashMutation.mutate({ customerId: selectedCustomerId, washType });
                            }
                          }}
                          className="w-full bg-gold hover:bg-gold-dark text-premium"
                          disabled={!washType}
                        >
                          Confirmar Lavagem
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredCustomers.length === 0 && (
          <Card className="bg-card/50 backdrop-blur border-gold/20">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Nenhum cliente encontrado</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Customers;
