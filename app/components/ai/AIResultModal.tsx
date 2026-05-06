"use client";

import { useEffect, useState } from "react";
import GlassCard from "../GlassCard";

interface AIResultModalProps {
  isOpen: boolean;
  aiResult: {
    predictedEnergyImpact: number;
    confidence: number;
    optimalTime: string;
    categoryMatch: string;
    mlInsights: string[];
  } | null;
  activityTitle: string;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

export default function AIResultModal({
  isOpen,
  aiResult,
  activityTitle,
  onSave,
  onCancel,
  isSaving,
}: AIResultModalProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  if (!isOpen || !aiResult) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-surface/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onCancel}
      />

      {/* Modal Content */}
      <div className={`relative w-full max-w-md transform transition-all duration-500 ${showContent ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <GlassCard className="p-6 shadow-2xl border-2 border-primary/20">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center mx-auto mb-4">
              <span 
                className="material-symbols-outlined text-[32px] text-on-primary-container"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                psychology
              </span>
            </div>
            <h2 className="font-h2 text-h2 text-on-surface mb-2">
              AI Analysis Complete
            </h2>
            <p className="font-body-md text-on-surface-variant">
              Analysis for: <span className="text-primary font-semibold">{activityTitle}</span>
            </p>
          </div>

          {/* Results */}
          <div className="space-y-4 mb-6">
            {/* Predicted Impact */}
            <div className="bg-surface-container-low rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant mb-1">
                  Predicted Energy Impact
                </p>
                <p className={`font-h2 text-h2 ${aiResult.predictedEnergyImpact > 0 ? 'text-secondary' : 'text-tertiary'}`}>
                  {aiResult.predictedEnergyImpact > 0 ? '+' : ''}{aiResult.predictedEnergyImpact}%
                </p>
              </div>
              <div className="text-right">
                <p className="font-label-sm text-label-sm text-on-surface-variant mb-1">
                  Confidence
                </p>
                <p className="font-h3 text-h3 text-primary">
                  {Math.round(aiResult.confidence * 100)}%
                </p>
              </div>
            </div>

            {/* Optimal Time */}
            <div className="bg-surface-container-low rounded-xl p-4">
              <p className="font-label-sm text-label-sm text-on-surface-variant mb-1">
                Optimal Time
              </p>
              <p className="font-h3 text-h3 text-primary">
                {aiResult.optimalTime}
              </p>
            </div>

            {/* ML Insights */}
            <div className="bg-surface-container-low rounded-xl p-4">
              <p className="font-label-sm text-label-sm text-on-surface-variant mb-2">
                AI Insights:
              </p>
              <ul className="space-y-2">
                {aiResult.mlInsights.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-body-md text-on-surface">
                    <span className="material-symbols-outlined text-[18px] text-secondary mt-0.5">
                      check_circle
                    </span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Warning Message */}
          <div className="bg-tertiary-fixed-dim/30 rounded-xl p-3 mb-6 flex items-start gap-3">
            <span className="material-symbols-outlined text-tertiary text-[20px] mt-0.5">
              info
            </span>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              Don&apos;t forget to save your activity to track your energy patterns!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isSaving}
              className="flex-1 py-3 px-4 rounded-xl bg-surface-container text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-high transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={isSaving}
              className="flex-1 py-3 px-4 rounded-xl bg-primary text-on-primary font-label-md text-label-md shadow-lg hover:bg-primary-container hover:text-on-primary-container transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Save Activity
                </>
              )}
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
