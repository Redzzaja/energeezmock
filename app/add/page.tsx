"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TopAppBar from "../components/TopAppBar";
import BottomNav from "../components/BottomNav";
import GlassCard from "../components/GlassCard";
import PageLayout from "../components/PageLayout";
import AIProcessingModal from "../components/ai/AIProcessingModal";
import AIResultModal from "../components/ai/AIResultModal";
import { processActivityWithAI, createActivity } from "../actions/activityActions";

const activityTypes = [
  // Work/Exercise/Mindfulness/Social = INCREASE energy (active/productive)
  // Meal/Rest = DECREASE energy (resting/idle)
  // Values are per-hour rates (impact calculated dynamically based on duration)
  { icon: "work", label: "Work", description: "Tasks & projects", color: "bg-primary-container text-on-primary-container", energyPerHour: 15 },
  { icon: "directions_run", label: "Exercise", description: "Cardio & strength", color: "bg-secondary-container text-on-secondary-container", energyPerHour: 20 },
  { icon: "restaurant", label: "Meal", description: "Breakfast, lunch, dinner", color: "bg-tertiary-fixed-dim text-on-tertiary-container", energyPerHour: -10 },
  { icon: "self_improvement", label: "Mindfulness", description: "Meditation & breathing", color: "bg-surface-container-high text-on-surface", energyPerHour: 18 },
  { icon: "social_distance", label: "Social", description: "Meetings & hangouts", color: "bg-secondary-fixed text-on-secondary-container", energyPerHour: 8 },
  { icon: "bedtime", label: "Rest", description: "Sleep & relaxation", color: "bg-primary-fixed text-on-primary-fixed", energyPerHour: -15 },
];



const quickDurations = [15, 30, 45, 60, 90, 120];

export default function AddActivityPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState("");
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAIProcessing, setShowAIProcessing] = useState(false);
  const [showAIResultModal, setShowAIResultModal] = useState(false);
  const [aiResult, setAiResult] = useState<{
    predictedEnergyImpact: number;
    confidence: number;
    optimalTime: string;
    categoryMatch: string;
    mlInsights: string[];
  } | null>(null);

  const handleStartAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedType) return;
    
    setShowAIProcessing(true);
  };

  const handleAIComplete = (result: {
    predictedEnergyImpact: number;
    confidence: number;
    optimalTime: string;
    categoryMatch: string;
    mlInsights: string[];
  }) => {
    setAiResult(result);
    setShowAIProcessing(false);
    setShowAIResultModal(true);
  };

  const handleSaveActivity = async () => {
    if (!aiResult || !selectedType) return;
    
    setIsSubmitting(true);
    
    try {
      // Get user from localStorage
      const storedUser = localStorage.getItem("currentUser");
      let userId = 1; // Default to demo user
      
      if (storedUser) {
        const user = JSON.parse(storedUser);
        userId = user.id || 1;
      }
      
      // Get category ID
      const categoryId = activityTypes.findIndex(t => t.label === selectedType) + 1;
      
      const result = await createActivity({
        userId: userId,
        categoryId: categoryId,
        title: selectedType,
        description: notes || undefined,
        duration: duration,
        energyImpact: aiResult.predictedEnergyImpact,
        notes: notes || undefined,
        aiProcessed: true,
        aiData: {
          confidence: aiResult.confidence,
          optimalTime: aiResult.optimalTime,
          mlInsights: aiResult.mlInsights,
          categoryMatch: aiResult.categoryMatch,
        },
      });
      
      if (result.success) {
        router.push("/home");
      } else {
        console.error("Failed to save activity");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error saving activity:", error);
      setIsSubmitting(false);
    }
  };

  const handleCancelAI = () => {
    setShowAIProcessing(false);
  };

  const handleCloseResultModal = () => {
    setShowAIResultModal(false);
  };

  const handleCancelResult = () => {
    setShowAIResultModal(false);
    // Keep the form state so user can edit and re-analyze
  };

  const selectedTypeData = activityTypes.find((t) => t.label === selectedType);

  return (
    <PageLayout>
      <div className="min-h-screen bg-surface relative md:pb-0 pb-20">
        {/* Mobile TopAppBar */}
        <div className="md:hidden">
          <TopAppBar
            showSettings={false}
            showBack={true}
            onBack={() => router.push("/home")}
          />
        </div>

        <main className="px-5 pt-[72px] md:pt-0 pb-6">
          {/* Header - Desktop */}
          <div className="hidden md:flex md:items-center md:justify-between md:mb-8">
            <div>
              <h1 className="font-h1 text-h1 text-on-surface">Add Activity</h1>
              <p className="font-body-md text-on-surface-variant mt-1">
                Track your daily activities and monitor their energy impact.
              </p>
            </div>
            <button
              onClick={() => router.push("/home")}
              className="bg-surface-container text-on-surface-variant font-label-md text-label-md px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
              Cancel
            </button>
          </div>

          <form onSubmit={handleStartAnalysis} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Activity Type */}
                <section className="animate-fade-in-up">
                  <label className="block font-h3 text-h3 text-on-surface mb-4">
                    Activity Type
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {activityTypes.map((type, index) => (
                      <button
                        key={type.label}
                        type="button"
                        onClick={() => {
                          setSelectedType(type.label);
                        }}
                        className={`flex flex-col items-start gap-2 p-4 rounded-2xl transition-all text-left border-2 ${
                          selectedType === type.label
                            ? "border-primary bg-primary-container/20"
                            : "border-transparent hover:bg-surface-container bg-surface-container-low"
                        }`}
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${type.color}`}
                        >
                          <span className="material-symbols-outlined text-[24px]">{type.icon}</span>
                        </div>
                        <div>
                          <span className="font-label-md text-label-md text-on-surface block">
                            {type.label}
                          </span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            {type.description}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Duration */}
                <section className="animate-fade-in-up stagger-1">
                  <label className="block font-h3 text-h3 text-on-surface mb-4">
                    Duration
                  </label>

                  <GlassCard className="p-4 md:p-6">
                    {/* Quick Select Buttons */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {quickDurations.map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => setDuration(mins)}
                          className={`px-4 py-2 rounded-lg font-label-md text-label-md transition-all ${
                            duration === mins
                              ? 'bg-primary text-on-primary'
                              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                          }`}
                        >
                          {mins}m
                        </button>
                      ))}
                    </div>

                    {/* Manual Input */}
                    <div className="flex items-center justify-between mb-4">
                      <button
                        type="button"
                        onClick={() => setDuration(Math.max(5, duration - 5))}
                        className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors"
                      >
                        <span className="material-symbols-outlined">remove</span>
                      </button>

                      <div className="text-center">
                        <span className="font-h1 text-h1 text-primary">{duration}</span>
                        <span className="font-body-md text-body-md text-on-surface-variant ml-1">
                          minutes
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setDuration(duration + 5)}
                        className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors"
                      >
                        <span className="material-symbols-outlined">add</span>
                      </button>
                    </div>

                    <input
                      type="range"
                      min="5"
                      max="180"
                      step="5"
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value))}
                      className="w-full h-2 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
                    />

                    <div className="flex justify-between mt-2">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        5 min
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        3 hours
                      </span>
                    </div>
                  </GlassCard>
                </section>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Notes */}
                <section className="animate-fade-in-up stagger-2">
                  <label className="block font-h3 text-h3 text-on-surface mb-4">
                    Notes (Optional)
                  </label>

                  <GlassCard className="p-4 md:p-6">
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="How did this activity make you feel? What were you working on? Any observations about your energy levels?"
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl bg-surface-container border border-surface-variant text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-body-md resize-none"
                    />
                    <p className="font-label-sm text-label-sm text-on-surface-variant mt-2">
                      {notes.length}/500 characters
                    </p>
                  </GlassCard>
                </section>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 animate-fade-in-up stagger-3">
              <button
                type="button"
                onClick={() => router.push("/home")}
                className="hidden md:flex flex-1 py-4 rounded-xl bg-surface-container text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-high transition-colors items-center justify-center gap-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedType || isSubmitting}
                className="flex-1 py-4 rounded-xl bg-primary text-on-primary font-label-md text-label-md shadow-lg hover:bg-primary-container hover:text-on-primary-container transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">psychiatry</span>
                {isSubmitting ? "Processing..." : "Analyze with AI"}
              </button>
            </div>
          </form>
        </main>

        <BottomNav />
      </div>

      {/* AI Processing Modal */}
      <AIProcessingModal
        isOpen={showAIProcessing}
        activityTitle={selectedType || "Activity"}
        onComplete={handleAIComplete}
        onCancel={handleCancelAI}
      />

      {/* AI Result Modal - Popup to force save action */}
      <AIResultModal
        isOpen={showAIResultModal}
        aiResult={aiResult}
        activityTitle={selectedType || "Activity"}
        onSave={handleSaveActivity}
        onCancel={handleCancelResult}
        isSaving={isSubmitting}
      />
    </PageLayout>
  );
}