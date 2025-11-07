import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { TrendingDown, TrendingUp, Package, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Admin = () => {
  const [newExpense, setNewExpense] = useState({ description: "", amount: "" });
  const [newRevenue, setNewRevenue] = useState({ description: "", amount: "" });
  const [newStock, setNewStock] = useState({ productName: "", quantity: "", unit: "" });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: expenses = [] } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: revenues = [] } = useQuery({
    queryKey: ["revenues"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("revenue")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: stock = [] } = useQuery({
    queryKey: ["stock"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stock")
        .select("*")
        .order("product_name");
      if (error) throw error;
      return data;
    },
  });

  const addExpenseMutation = useMutation({
    mutationFn: async (expense: typeof newExpense) => {
      const { error } = await supabase.from("expenses").insert([{
        description: expense.description,
        amount: parseFloat(expense.amount),
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      setNewExpense({ description: "", amount: "" });
      toast({ title: "Gasto adicionado com sucesso!" });
    },
  });

  const addRevenueMutation = useMutation({
    mutationFn: async (revenue: typeof newRevenue) => {
      const { error } = await supabase.from("revenue").insert([{
        description: revenue.description,
        amount: parseFloat(revenue.amount),
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["revenues"] });
      setNewRevenue({ description: "", amount: "" });
      toast({ title: "Ganho adicionado com sucesso!" });
    },
  });

  const addStockMutation = useMutation({
    mutationFn: async (item: typeof newStock) => {
      const { error } = await supabase.from("stock").insert([{
        product_name: item.productName,
        quantity: parseInt(item.quantity),
        unit: item.unit,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      setNewStock({ productName: "", quantity: "", unit: "" });
      toast({ title: "Item adicionado ao stock!" });
    },
  });

  const deleteStockMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("stock").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      toast({ title: "Item removido do stock!" });
    },
  });

  const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount.toString()), 0);
  const totalRevenue = revenues.reduce((sum, rev) => sum + parseFloat(rev.amount.toString()), 0);
  const balance = totalRevenue - totalExpenses;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-gold">Área Administrativa</h1>
          <p className="text-gold/70 mt-2">Gerencie gastos, ganhos e stock</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-card/50 backdrop-blur border-gold/20">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Gastos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-destructive" />
                <span className="text-2xl font-bold text-foreground">€{totalExpenses.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-gold/20">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Ganhos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-gold" />
                <span className="text-2xl font-bold text-foreground">€{totalRevenue.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-gold/20">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Balanço</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${balance >= 0 ? 'text-gold' : 'text-destructive'}`}>
                  €{balance.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="expenses" className="space-y-4">
          <TabsList className="bg-premium-light border border-gold/20">
            <TabsTrigger value="expenses" className="data-[state=active]:bg-gold data-[state=active]:text-premium">
              Gastos
            </TabsTrigger>
            <TabsTrigger value="revenue" className="data-[state=active]:bg-gold data-[state=active]:text-premium">
              Ganhos
            </TabsTrigger>
            <TabsTrigger value="stock" className="data-[state=active]:bg-gold data-[state=active]:text-premium">
              Stock
            </TabsTrigger>
          </TabsList>

          <TabsContent value="expenses" className="space-y-4">
            <Card className="bg-card/50 backdrop-blur border-gold/20">
              <CardHeader>
                <CardTitle className="text-gold">Adicionar Gasto</CardTitle>
                <CardDescription className="text-muted-foreground">Registe um novo gasto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="expense-desc">Descrição</Label>
                  <Input
                    id="expense-desc"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    placeholder="Ex: Produtos de limpeza"
                    className="border-gold/20"
                  />
                </div>
                <div>
                  <Label htmlFor="expense-amount">Valor (€)</Label>
                  <Input
                    id="expense-amount"
                    type="number"
                    step="0.01"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    placeholder="0.00"
                    className="border-gold/20"
                  />
                </div>
                <Button
                  onClick={() => addExpenseMutation.mutate(newExpense)}
                  className="w-full bg-gold hover:bg-gold-dark text-premium"
                  disabled={!newExpense.description || !newExpense.amount}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Gasto
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-gold/20">
              <CardHeader>
                <CardTitle className="text-gold">Histórico de Gastos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="flex justify-between items-center py-2 border-b border-gold/10">
                      <div>
                        <p className="font-medium text-foreground">{expense.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(expense.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                      </div>
                      <span className="text-destructive font-semibold">-€{parseFloat(expense.amount.toString()).toFixed(2)}</span>
                    </div>
                  ))}
                  {expenses.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">Nenhum gasto registado</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <Card className="bg-card/50 backdrop-blur border-gold/20">
              <CardHeader>
                <CardTitle className="text-gold">Adicionar Ganho Manual</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Registe ganhos adicionais (as lavagens são adicionadas automaticamente)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="revenue-desc">Descrição</Label>
                  <Input
                    id="revenue-desc"
                    value={newRevenue.description}
                    onChange={(e) => setNewRevenue({ ...newRevenue, description: e.target.value })}
                    placeholder="Ex: Serviço extra"
                    className="border-gold/20"
                  />
                </div>
                <div>
                  <Label htmlFor="revenue-amount">Valor (€)</Label>
                  <Input
                    id="revenue-amount"
                    type="number"
                    step="0.01"
                    value={newRevenue.amount}
                    onChange={(e) => setNewRevenue({ ...newRevenue, amount: e.target.value })}
                    placeholder="0.00"
                    className="border-gold/20"
                  />
                </div>
                <Button
                  onClick={() => addRevenueMutation.mutate(newRevenue)}
                  className="w-full bg-gold hover:bg-gold-dark text-premium"
                  disabled={!newRevenue.description || !newRevenue.amount}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Ganho
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-gold/20">
              <CardHeader>
                <CardTitle className="text-gold">Histórico de Ganhos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {revenues.map((revenue) => (
                    <div key={revenue.id} className="flex justify-between items-center py-2 border-b border-gold/10">
                      <div>
                        <p className="font-medium text-foreground">{revenue.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(revenue.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                      </div>
                      <span className="text-gold font-semibold">+€{parseFloat(revenue.amount.toString()).toFixed(2)}</span>
                    </div>
                  ))}
                  {revenues.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">Nenhum ganho registado</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stock" className="space-y-4">
            <Card className="bg-card/50 backdrop-blur border-gold/20">
              <CardHeader>
                <CardTitle className="text-gold">Adicionar ao Stock</CardTitle>
                <CardDescription className="text-muted-foreground">Adicione novos produtos ao inventário</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="product-name">Nome do Produto</Label>
                  <Input
                    id="product-name"
                    value={newStock.productName}
                    onChange={(e) => setNewStock({ ...newStock, productName: e.target.value })}
                    placeholder="Ex: Shampoo para carros"
                    className="border-gold/20"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="quantity">Quantidade</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={newStock.quantity}
                      onChange={(e) => setNewStock({ ...newStock, quantity: e.target.value })}
                      placeholder="0"
                      className="border-gold/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit">Unidade</Label>
                    <Input
                      id="unit"
                      value={newStock.unit}
                      onChange={(e) => setNewStock({ ...newStock, unit: e.target.value })}
                      placeholder="Ex: litros, unidades"
                      className="border-gold/20"
                    />
                  </div>
                </div>
                <Button
                  onClick={() => addStockMutation.mutate(newStock)}
                  className="w-full bg-gold hover:bg-gold-dark text-premium"
                  disabled={!newStock.productName || !newStock.quantity}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar ao Stock
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-gold/20">
              <CardHeader>
                <CardTitle className="text-gold flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Inventário de Stock
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stock.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-3 border-b border-gold/10">
                      <div>
                        <p className="font-medium text-foreground">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} {item.unit}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteStockMutation.mutate(item.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {stock.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">Nenhum item em stock</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
