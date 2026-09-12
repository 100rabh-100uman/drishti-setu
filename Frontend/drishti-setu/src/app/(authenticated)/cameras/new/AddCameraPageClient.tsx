"use client";

import { useRouter } from "next/navigation";
import { useAddCameraForm } from "@/hooks/useAddCameraForm";
import { AddCameraHeader } from "@/components/cameras/add-camera/AddCameraHeader";
import { CameraFormStepper } from "@/components/cameras/add-camera/CameraFormStepper";
import { CameraIdentityStep } from "@/components/cameras/add-camera/CameraIdentityStep";
import { DepartmentLocationStep } from "@/components/cameras/add-camera/DepartmentLocationStep";
import { CameraNetworkStep } from "@/components/cameras/add-camera/CameraNetworkStep";
import { CameraStatusStep } from "@/components/cameras/add-camera/CameraStatusStep";
import { CameraReviewStep } from "@/components/cameras/add-camera/CameraReviewStep";
import { RegistrationSummary } from "@/components/cameras/add-camera/RegistrationSummary";
import { FormNavigation } from "@/components/cameras/add-camera/FormNavigation";
import { CameraCreatedDialog } from "@/components/cameras/add-camera/CameraCreatedDialog";

export default function AddCameraPageClient() {
  const router = useRouter();
  const {
    form,
    currentStep,
    completedSteps,
    isSubmitting,
    submitResult,
    departments,
    zones,
    loadingZones,
    nextStep,
    prevStep,
    goToStep,
    handleSubmit,
    saveDraft,
    resetForm,
    loadDepartmentZones,
  } = useAddCameraForm();

  const handleBack = () => {
    if (currentStep > 1) {
      prevStep();
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-transparent pb-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <AddCameraHeader />
        
        <CameraFormStepper
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={goToStep}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Area */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-[#0c162d] rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800 p-8 min-h-[600px]">
              <form onSubmit={(e) => e.preventDefault()}>
                {currentStep === 1 && <CameraIdentityStep form={form} />}
                {currentStep === 2 && (
                  <DepartmentLocationStep
                    form={form}
                    departments={departments}
                    zones={zones}
                    loadingZones={loadingZones}
                    onDepartmentChange={loadDepartmentZones}
                  />
                )}
                {currentStep === 3 && <CameraNetworkStep form={form} />}
                {currentStep === 4 && <CameraStatusStep form={form} />}
                {currentStep === 5 && <CameraReviewStep form={form} onEditStep={goToStep} />}
              </form>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 hidden lg:block">
            <RegistrationSummary
              form={form}
              currentStep={currentStep}
              completedSteps={completedSteps}
            />
          </div>
        </div>
      </div>

      <FormNavigation
        currentStep={currentStep}
        isSubmitting={isSubmitting}
        onBack={handleBack}
        onNext={nextStep}
        onSaveDraft={saveDraft}
        onSubmit={handleSubmit}
      />

      <CameraCreatedDialog
        result={submitResult}
        onViewCamera={(cameraId) => {
          router.push(`/cameras/${encodeURIComponent(cameraId)}`);
        }}
        onAddAnother={() => {
          resetForm();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onBackToDashboard={() => {
          router.push("/dashboard");
        }}
      />
    </div>
  );
}
