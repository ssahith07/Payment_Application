
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-md w-full px-4 py-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Welcome to Payment App</h1>
          <p className="text-gray-600 mb-6">Send and receive money easily with your friends</p>
          
          <div className="space-y-4">
            <Button asChild className="w-full">
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
            
            <div className="flex space-x-4">
              <Button asChild variant="outline" className="flex-1">
                <Link to="/login">Log In</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
