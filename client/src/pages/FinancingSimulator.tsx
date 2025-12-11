import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, Download, TrendingUp, Building2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// Taxas dos principais bancos que atuam no DF (atualizar periodicamente)
const BANKS = [
  { name: "Caixa Econômica Federal", rate: 9.99, maxTerm: 420 },
  { name: "Banco do Brasil", rate: 10.49, maxTerm: 420 },
  { name: "Bradesco", rate: 10.99, maxTerm: 360 },
  { name: "Itaú", rate: 11.29, maxTerm: 360 },
  { name: "Santander", rate: 11.49, maxTerm: 360 },
  { name: "BRB - Banco de Brasília", rate: 9.79, maxTerm: 420 },
];

interface SimulationResult {
  bank: string;
  rate: number;
  sacFirstInstallment: number;
  sacLastInstallment: number;
  sacTotalAmount: number;
  sacTotalInterest: number;
  priceInstallment: number;
  priceTotalAmount: number;
  priceTotalInterest: number;
}

export default function FinancingSimulator() {
  const [propertyValue, setPropertyValue] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [termYears, setTermYears] = useState("30");
  const [clientName, setClientName] = useState("");
  const [clientCpf, setClientCpf] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  // TODO: Implementar router financing
  // const saveSimulation = trpc.financing.saveSimulation.useMutation();

  // Cálculo SAC (Sistema de Amortização Constante)
  const calculateSAC = (principal: number, annualRate: number, months: number) => {
    const monthlyRate = annualRate / 100 / 12;
    const amortization = principal / months;
    let balance = principal;
    let totalInterest = 0;
    const installments = [];

    for (let i = 1; i <= months; i++) {
      const interest = balance * monthlyRate;
      const installment = amortization + interest;
      totalInterest += interest;
      balance -= amortization;
      installments.push(installment);
    }

    return {
      firstInstallment: installments[0],
      lastInstallment: installments[installments.length - 1],
      totalAmount: principal + totalInterest,
      totalInterest,
    };
  };

  // Cálculo PRICE (Tabela Price)
  const calculatePRICE = (principal: number, annualRate: number, months: number) => {
    const monthlyRate = annualRate / 100 / 12;
    const installment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);
    const totalAmount = installment * months;
    const totalInterest = totalAmount - principal;

    return {
      installment,
      totalAmount,
      totalInterest,
    };
  };

  const handleSimulate = () => {
    const propValue = parseFloat(propertyValue.replace(/\D/g, ""));
    const down = parseFloat(downPayment.replace(/\D/g, ""));
    const years = parseInt(termYears);

    if (!propValue || !down || !years) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (down >= propValue) {
      toast.error("A entrada deve ser menor que o valor do imóvel");
      return;
    }

    const financedAmount = propValue - down;
    const months = years * 12;

    const simulationResults: SimulationResult[] = BANKS.map((bank) => {
      const sac = calculateSAC(financedAmount, bank.rate, months);
      const price = calculatePRICE(financedAmount, bank.rate, months);

      return {
        bank: bank.name,
        rate: bank.rate,
        sacFirstInstallment: sac.firstInstallment,
        sacLastInstallment: sac.lastInstallment,
        sacTotalAmount: sac.totalAmount,
        sacTotalInterest: sac.totalInterest,
        priceInstallment: price.installment,
        priceTotalAmount: price.totalAmount,
        priceTotalInterest: price.totalInterest,
      };
    });

    setResults(simulationResults);
    setShowResults(true);

    // Salvar simulação no banco se tiver dados do cliente
    if (clientName && clientCpf) {
      saveSimulation.mutate({
        clientName,
        clientCpf,
        clientPhone,
        clientEmail,
        propertyValue: propValue,
        downPayment: down,
        financedAmount,
        termMonths: months,
        simulationResults: JSON.stringify(simulationResults),
      });
    }

    toast.success("Simulação gerada com sucesso!");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Calculator className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Simulador de Financiamento Imobiliário</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Compare as melhores condições de financiamento dos principais bancos que atuam no
            Distrito Federal
          </p>
        </div>

        {/* Formulário */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Dados da Simulação
            </CardTitle>
            <CardDescription>
              Preencha os dados abaixo para simular seu financiamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dados do Imóvel */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Dados do Imóvel</h3>
                
                <div>
                  <Label htmlFor="propertyValue">Valor do Imóvel *</Label>
                  <Input
                    id="propertyValue"
                    placeholder="R$ 500.000,00"
                    value={propertyValue}
                    onChange={(e) => setPropertyValue(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="downPayment">Valor da Entrada *</Label>
                  <Input
                    id="downPayment"
                    placeholder="R$ 100.000,00"
                    value={downPayment}
                    onChange={(e) => setDownPayment(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="termYears">Prazo (anos) *</Label>
                  <Select value={termYears} onValueChange={setTermYears}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 10, 15, 20, 25, 30, 35].map((years) => (
                        <SelectItem key={years} value={years.toString()}>
                          {years} anos
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dados do Cliente */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Seus Dados (opcional)</h3>
                
                <div>
                  <Label htmlFor="clientName">Nome Completo</Label>
                  <Input
                    id="clientName"
                    placeholder="Seu nome"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="clientCpf">CPF</Label>
                  <Input
                    id="clientCpf"
                    placeholder="000.000.000-00"
                    value={clientCpf}
                    onChange={(e) => setClientCpf(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="clientPhone">Telefone</Label>
                  <Input
                    id="clientPhone"
                    placeholder="(61) 98888-8888"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="clientEmail">E-mail</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    placeholder="seu@email.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Button onClick={handleSimulate} className="w-full mt-6" size="lg">
              <Calculator className="mr-2 h-5 w-5" />
              Simular Financiamento
            </Button>
          </CardContent>
        </Card>

        {/* Resultados */}
        {showResults && results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Resultados da Simulação
              </CardTitle>
              <CardDescription>
                Comparativo das condições de financiamento em {results.length} bancos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="sac" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="sac">Sistema SAC</TabsTrigger>
                  <TabsTrigger value="price">Tabela PRICE</TabsTrigger>
                </TabsList>

                <TabsContent value="sac" className="space-y-4">
                  <div className="text-sm text-muted-foreground mb-4">
                    No SAC, a parcela diminui ao longo do tempo. Você paga mais juros no início e
                    menos no final.
                  </div>
                  {results.map((result, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-lg">{result.bank}</CardTitle>
                        <CardDescription>Taxa: {result.rate}% ao ano</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">1ª Parcela</p>
                            <p className="text-lg font-semibold">
                              {formatCurrency(result.sacFirstInstallment)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Última Parcela</p>
                            <p className="text-lg font-semibold">
                              {formatCurrency(result.sacLastInstallment)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total de Juros</p>
                            <p className="text-lg font-semibold text-orange-600">
                              {formatCurrency(result.sacTotalInterest)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Valor Total</p>
                            <p className="text-lg font-semibold">
                              {formatCurrency(result.sacTotalAmount)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="price" className="space-y-4">
                  <div className="text-sm text-muted-foreground mb-4">
                    Na Tabela PRICE, a parcela é fixa do início ao fim. Você paga mais juros no
                    total.
                  </div>
                  {results.map((result, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-lg">{result.bank}</CardTitle>
                        <CardDescription>Taxa: {result.rate}% ao ano</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Parcela Fixa</p>
                            <p className="text-lg font-semibold">
                              {formatCurrency(result.priceInstallment)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total de Juros</p>
                            <p className="text-lg font-semibold text-orange-600">
                              {formatCurrency(result.priceTotalInterest)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Valor Total</p>
                            <p className="text-lg font-semibold">
                              {formatCurrency(result.priceTotalAmount)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>

              <div className="mt-6 flex gap-4">
                <Button variant="outline" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Baixar Relatório PDF
                </Button>
                <Button variant="outline" className="flex-1">
                  Enviar por E-mail
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
