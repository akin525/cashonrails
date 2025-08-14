import React from 'react';

type TimelineStep = {
  label: string;
  timestamp: string;
};

type TimelineProps = {
  steps: TimelineStep[];
  currentStep: number; // Index of the current step
};

const Timeline: React.FC<TimelineProps> = ({ steps, currentStep }) => {
  return (
    <div className="flex flex-col items-start space-y-0 h-full">
      {steps.map((step, index) => (
        <div key={index} className="flex items-start space-x-4 h-full">
          {/* Circle */}
          <div className="flex flex-col items-center h-full">
            <div
              className={`w-4 h-4 border-[#01AB79] border rounded-full ${
                index === currentStep
                  ? 'bg-white border-2'
                  : index < currentStep
                  ? 'bg-[#01AB79]'
                  : ''
              }`}
            />
            {index < steps.length - 1 && (
              <div
                className={`h-14 w-0 border-[0.8px] border-[#01AB79]`}
              />
            )}
          </div>

          {/* Label and Timestamp */}
          <div>
            <h3
              className={`font-medium ${
                index <= currentStep ? 'text-black' : 'text-gray-400'
              }`}
            >
              {step.label}
            </h3>
            <p className="text-sm text-gray-500">{step.timestamp}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;
