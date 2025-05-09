
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { UserProfile } from "@/components/UserProfile";
import { MemberList } from "@/components/MemberList";
import { TransferMoney } from "@/components/TransferMoney";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [balances, setBalances] = useState({ available: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }
      
      try {
        // Fetch user profile
        const userResponse = await fetch('YOUR_BACKEND_URL/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!userResponse.ok) {
          throw new Error('Authentication failed');
        }
        
        const userData = await userResponse.json();
        setUser(userData);
        
        // Fetch members/contacts
        const membersResponse = await fetch('YOUR_BACKEND_URL/api/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (membersResponse.ok) {
          const membersData = await membersResponse.json();
          setMembers(membersData);
        }
        
        // Fetch transactions
        const transactionsResponse = await fetch('YOUR_BACKEND_URL/api/transactions', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (transactionsResponse.ok) {
          const transactionsData = await transactionsResponse.json();
          setTransactions(transactionsData);
        }
        
        // Fetch balance
        const balanceResponse = await fetch('YOUR_BACKEND_URL/api/balance', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (balanceResponse.ok) {
          const balanceData = await balanceResponse.json();
          setBalances({
            available: balanceData.available || 0,
            pending: balanceData.pending || 0
          });
        }
        
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        toast({
          title: "Authentication Error",
          description: "Please login again",
          variant: "destructive",
        });
        localStorage.removeItem('token');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Payment App</h1>
          <UserProfile user={user} />
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto py-8 px-4">
        {/* Balance Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Available Balance</CardTitle>
              <CardDescription>Available to send or withdraw</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">${balances.available.toFixed(2)}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Pending Balance</CardTitle>
              <CardDescription>Awaiting confirmation</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">${balances.pending.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabs Section */}
        <Tabs defaultValue="transfer" className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="transfer">Send Money</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="transfer" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Transfer Money</CardTitle>
                <CardDescription>Send money to friends and family</CardDescription>
              </CardHeader>
              <CardContent>
                <TransferMoney members={members} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="contacts">
            <Card>
              <CardHeader>
                <CardTitle>Your Contacts</CardTitle>
                <CardDescription>People you can send money to</CardDescription>
              </CardHeader>
              <CardContent>
                <MemberList members={members} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>Your recent transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions.map(transaction => (
                      <div key={transaction._id} className="flex justify-between items-center border-b pb-4">
                        <div>
                          <p className="font-medium">
                            {transaction.otherParty?.name || 'Unknown'}
                            {' '}
                            <span className="text-xs text-muted-foreground">
                              ({transaction.otherParty?.accountNumber || 'N/A'})
                            </span>
                          </p>
                          <p className="text-sm text-muted-foreground">{new Date(transaction.createdAt).toLocaleString()}</p>
                          {transaction.note && <p className="text-sm italic mt-1">{transaction.note}</p>}
                        </div>
                        <div className={`font-bold ${transaction.displayType === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.displayType === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-10 text-muted-foreground">No transactions yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
