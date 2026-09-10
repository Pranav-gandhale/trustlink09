"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, MapPin, Search, Tag, CheckCircle2 } from "lucide-react";
import { getTaskCatalog, TaskItem } from "@/lib/task-catalog";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function ServicePage({ params }: { params: Promise<{ type: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const serviceType = decodeURIComponent(resolvedParams.type);
  const [tasks, setTasks] = useState<TaskItem[]>([]);

  useEffect(() => {
    // getTaskCatalog returns an array from the static catalog
    const catalogTasks = getTaskCatalog(serviceType);
    setTasks(catalogTasks);
  }, [serviceType]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="h-16 border-b bg-white flex items-center px-6 sticky top-0 z-10 shadow-sm">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-600 hover:text-slate-900 transition-colors">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div className="ml-4">
          <h1 className="text-lg font-bold text-slate-900">{serviceType} Services</h1>
          <p className="text-xs text-slate-600">Common problems and upfront pricing</p>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
        <div className="bg-white rounded-2xl border p-8 shadow-sm mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mx-auto h-16 w-16 bg-blue-100 text-primary rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Need a {serviceType}?</h2>
          <p className="text-slate-600 mb-6 max-w-lg mx-auto">
            Browse common tasks below so you know what to expect, or jump straight into the map to find a top-rated, verified professional in your neighborhood.
          </p>
          <Link 
            href={`/map?service=${encodeURIComponent(serviceType)}`}
            className="inline-flex items-center justify-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            <MapPin className="h-5 w-5" />
            Find {serviceType} Near Me
          </Link>
        </div>

        <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
          <Tag className="h-5 w-5 text-primary" />
          Common Tasks & Pricing
        </h3>

        {tasks.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {tasks.map((task, i) => (
              <div 
                key={task.code} 
                className="bg-white rounded-xl border p-5 shadow-sm hover:border-primary/30 transition-all animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-900 pr-4">{task.title}</h4>
                  <span className="shrink-0 bg-green-100 text-green-800 text-xs font-black px-2.5 py-1 rounded-full whitespace-nowrap">
                    {formatCurrency(task.fixedPrice)}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                  {task.description}
                </p>
                <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                  Fixed price inspection
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border p-12 text-center shadow-sm">
            <p className="text-slate-500 font-medium">No common tasks cataloged for this service yet.</p>
            <p className="text-sm text-slate-400 mt-2">You can still find providers on the map and request custom quotes.</p>
          </div>
        )}
      </main>
    </div>
  );
}
