import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const Products = () => {
  return (
    <div className="min-h-screen bg-black p-8 text-white">
      <div className="max-w-6xl mx-auto">
        <Navbar/>
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Our Products</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover our suite of AI-powered tools designed to streamline your development workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-linear-to-b from-[#ffffff05] to-black/50 rounded-2xl border border-[#ffffff1a] p-8">
            <h3 className="text-2xl font-bold text-white mb-4">AI PR Reviews</h3>
            <p className="text-muted-foreground mb-6">
              Automated pull request reviews with intelligent suggestions to improve code quality and maintainability.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-muted-foreground">Automated code analysis</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-muted-foreground">Best practice recommendations</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-muted-foreground">Quality score metrics</span>
              </li>
            </ul>
            <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white">
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>

          <div className="bg-linear-to-b from-[#ffffff05] to-black/50 rounded-2xl border border-[#ffffff1a] p-8">
            <h3 className="text-2xl font-bold text-white mb-4">Issue Tagging</h3>
            <p className="text-muted-foreground mb-6">
              Automatically categorize and label issues based on content analysis and historical patterns.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-muted-foreground">Smart categorization</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-muted-foreground">Custom label creation</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-muted-foreground">Priority classification</span>
              </li>
            </ul>
            <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white">
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>

          <div className="bg-linear-to-b from-[#ffffff05] to-black/50 rounded-2xl border border-[#ffffff1a] p-8">
            <h3 className="text-2xl font-bold text-white mb-4">Team Analytics</h3>
            <p className="text-muted-foreground mb-6">
              Comprehensive analytics and insights to improve team productivity and code quality.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-muted-foreground">Performance metrics</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-muted-foreground">Code quality trends</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-muted-foreground">Review insights</span>
              </li>
            </ul>
            <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white">
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>

        <div className="text-center">
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3">
            <Link href="/pricing">View Pricing</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Products;