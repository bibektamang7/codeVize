import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Plan {
  id: string;
  name: string;
  price: number;
  maxRepos: number;
  description: string;
  features: string[];
  popular?: boolean;
}

const Pricing = () => {
  const plans: Plan[] = [
    {
      id: "free",
      name: "Free",
      price: 0,
      maxRepos: 1,
      description: "Perfect for individual developers getting started",
      features: [
        "1 Active Repository",
        "Basic PR Reviews",
        "Manual Issue Tagging",
        "Standard Support",
        "Up to 50 PRs per month"
      ]
    },
    {
      id: "pro",
      name: "Pro",
      price: 19,
      maxRepos: 5,
      description: "Ideal for growing teams and projects",
      features: [
        "5 Active Repositories",
        "Advanced AI PR Reviews",
        "Automated Issue Tagging",
        "Priority Support",
        "Unlimited PRs",
        "Custom Issue Labels",
        "Team Collaboration Tools"
      ],
      popular: true
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: 99,
      maxRepos: 50,
      description: "For large organizations with complex needs",
      features: [
        "50 Active Repositories",
        "Advanced AI PR Reviews",
        "Automated Issue Tagging",
        "24/7 Dedicated Support",
        "Unlimited PRs",
        "Custom Issue Labels",
        "Team Collaboration Tools",
        "Advanced Analytics",
        "Custom Integrations",
        "SSO & SAML Support"
      ]
    }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-black to-[#0a0a0a]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
            Simple, transparent pricing
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your team's needs. All plans include our core AI-powered features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`relative rounded-2xl border ${
                plan.popular 
                  ? "border-indigo-500/50 bg-gradient-to-b from-indigo-900/10 to-black/80 shadow-lg shadow-indigo-500/20" 
                  : "border-[#ffffff1a] bg-gradient-to-b from-[#ffffff05] to-black/50"
              } p-6 flex flex-col`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-indigo-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="mt-6">
                <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="mt-2 text-muted-foreground text-sm">{plan.description}</p>
                
                <div className="my-6">
                  <div className="text-muted-foreground text-sm mb-2">
                    Up to <span className="text-white font-medium">{plan.maxRepos}</span> active repositories
                  </div>
                </div>
                
                <ul className="space-y-3 flex-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={18} />
                      <span className="text-muted-foreground text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full mt-8 ${
                    plan.popular 
                      ? "bg-indigo-600 hover:bg-indigo-500 text-white" 
                      : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
                  }`}
                >
                  Get Started
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;