import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Store, ArrowRight } from "lucide-react";

const Index = () => {
  const [selectedSection, setSelectedSection] = useState("");

  const handleNavigation = (section) => {
    setSelectedSection(section);
    // In a real app, you would use react-router-dom here
    console.log(`Navigating to: ${section}`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-pink-100 via-purple-100 to-pink-200">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute bg-pink-300 rounded-full -top-40 -right-40 w-80 h-80 opacity-20 blur-3xl animate-pulse" />
        <div className="absolute bg-purple-300 rounded-full -bottom-40 -left-40 w-80 h-80 opacity-30 blur-3xl animate-bounce" style={{ animationDuration: '3s' }} />
        <div className="absolute bg-pink-400 rounded-full opacity-25 top-1/2 left-1/2 w-60 h-60 blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      {/* Main content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center animate-fade-in">
        <div className="mb-8">
          <h1 className="mb-4 text-6xl font-bold text-gray-800">
            Artisan<span className="text-pink-600">Craft</span>
          </h1>
          <p className="mb-8 text-xl text-gray-600">
            Discover handmade treasures from talented artisans worldwide
          </p>
        </div>
        
        <div className="grid gap-6 mb-8 md:grid-cols-2">
          <div className="p-8 transition-all duration-300 border border-pink-200 shadow-lg bg-white/90 backdrop-blur-sm rounded-xl hover:shadow-xl group hover:border-pink-300">
            <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-pink-600 transition-transform group-hover:scale-110" />
            <h3 className="mb-2 text-2xl font-semibold text-gray-800">For Buyers</h3>
            <p className="mb-6 text-gray-600">
              Discover handmade pottery, textiles, paintings and more
            </p>
            <Button 
              onClick={() => handleNavigation('products')}
              className="w-full text-white shadow-md bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 hover:shadow-lg"
            >
              Browse Products <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          
          <div className="p-8 transition-all duration-300 border border-pink-200 shadow-lg bg-white/90 backdrop-blur-sm rounded-xl hover:shadow-xl group hover:border-pink-300">
            <Store className="w-12 h-12 mx-auto mb-4 text-pink-600 transition-transform group-hover:scale-110" />
            <h3 className="mb-2 text-2xl font-semibold text-gray-800">For Sellers</h3>
            <p className="mb-6 text-gray-600">
              Share your handmade creations with art lovers everywhere
            </p>
            <Button 
              onClick={() => handleNavigation('login')}
              variant="outline"
              className="w-full text-pink-600 border-2 border-pink-500 shadow-md hover:bg-gradient-to-r hover:from-pink-500 hover:to-pink-600 hover:text-white hover:border-pink-600 hover:shadow-lg"
            >
              Start Selling <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
        
        {selectedSection && (
          <div className="p-4 mb-6 bg-pink-100 border border-pink-300 rounded-lg">
            <p className="text-pink-800">
              Selected: {selectedSection} (In a real app, this would navigate to the {selectedSection} page)
            </p>
          </div>
        )}
        
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Powered by React.js • Node.js • MongoDB • JWT • Stripe
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
