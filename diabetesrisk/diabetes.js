/*
  © 2025 Milos Saric. All rights reserved.
  This JavaScript file is protected by copyright law and international treaties.
  Unauthorized use, copying, or distribution is strictly prohibited.
  For licensing inquiries, contact milossaric@outlook.com
*/

import React, { useState } from 'react';

const DiabetesPredictionTool = () => {
  // State for form values
  const [formData, setFormData] = useState({
    HighBP: "0",
    HighChol: "0",
    CholCheck: "0",
    BMI: "25",
    Smoker: "0",
    Stroke: "0",
    HeartDiseaseorAttack: "0",
    PhysActivity: "0",
    Fruits: "0",
    Veggies: "0",
    HvyAlcoholConsump: "0",
    AnyHealthcare: "0",
    NoDocbcCost: "0",
    GenHlth: "3",
    MentHlth: "0",
    PhysHlth: "0",
    DiffWalk: "0",
    Sex: "0",
    Age: "5",
    Education: "4",
    Income: "5"
  });

  // State for prediction result
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Function to make prediction
  const makePrediction = () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real application, this would call your backend API
      // that loads the trained model and makes a prediction
      
      // For this demo, we'll simulate a prediction based on known risk factors
      // This is a placeholder calculation - replace with your actual model prediction
      const riskFactors = [
        parseInt(formData.HighBP) * 1.5,
        parseInt(formData.HighChol) * 1.1,
        parseInt(formData.Stroke) * 1.3,
        parseInt(formData.HeartDiseaseorAttack) * 1.4,
        parseInt(formData.DiffWalk) * 0.8,
        Math.max(0, (parseFloat(formData.BMI) - 25) * 0.1),
        parseInt(formData.Age) * 0.2
      ];
      
      const riskScore = riskFactors.reduce((sum, factor) => sum + factor, 0);
      const hasDiabetes = riskScore > 3;
      
      setTimeout(() => {
        setPrediction({
          hasDiabetes: hasDiabetes,
          probability: Math.min(0.95, Math.max(0.05, riskScore / 10)) // Capped between 5% and 95%
        });
        setLoading(false);
      }, 500); // Simulate API delay
    } catch (err) {
      setError("An error occurred during prediction. Please try again.");
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    makePrediction();
  };

  // Feature definitions
  const features = {
    binaryFeatures: [
      { name: "HighBP", description: "High Blood Pressure" },
      { name: "HighChol", description: "High Cholesterol" },
      { name: "CholCheck", description: "Cholesterol Check in 5 Years" },
      { name: "Smoker", description: "Smoked at least 100 cigarettes" },
      { name: "Stroke", description: "Ever had a stroke" },
      { name: "HeartDiseaseorAttack", description: "Coronary heart disease or myocardial infarction" },
      { name: "PhysActivity", description: "Physical activity in past 30 days" },
      { name: "Fruits", description: "Consume fruit 1 or more times per day" },
      { name: "Veggies", description: "Consume vegetables 1 or more times per day" },
      { name: "HvyAlcoholConsump", description: "Heavy alcohol consumption" },
      { name: "AnyHealthcare", description: "Have any kind of health care coverage" },
      { name: "NoDocbcCost", description: "Could not see doctor due to cost in past 12 months" },
      { name: "DiffWalk", description: "Serious difficulty walking or climbing stairs" },
    ],
    sexOptions: [
      { value: "0", label: "Female" },
      { value: "1", label: "Male" },
    ],
    genHlthOptions: [
      { value: "1", label: "Excellent" },
      { value: "2", label: "Very Good" },
      { value: "3", label: "Good" },
      { value: "4", label: "Fair" },
      { value: "5", label: "Poor" },
    ],
    ageOptions: [
      { value: "1", label: "18-24" },
      { value: "2", label: "25-29" },
      { value: "3", label: "30-34" },
      { value: "4", label: "35-39" },
      { value: "5", label: "40-44" },
      { value: "6", label: "45-49" },
      { value: "7", label: "50-54" },
      { value: "8", label: "55-59" },
      { value: "9", label: "60-64" },
      { value: "10", label: "65-69" },
      { value: "11", label: "70-74" },
      { value: "12", label: "75-79" },
      { value: "13", label: "80+" },
    ],
    educationOptions: [
      { value: "1", label: "Never attended school" },
      { value: "2", label: "Elementary" },
      { value: "3", label: "Some high school" },
      { value: "4", label: "High school graduate" },
      { value: "5", label: "Some college" },
      { value: "6", label: "College graduate" },
    ],
    incomeOptions: [
      { value: "1", label: "<$10K" },
      { value: "2", label: "$10-15K" },
      { value: "3", label: "$15-20K" },
      { value: "4", label: "$20-25K" },
      { value: "5", label: "$25-35K" },
      { value: "6", label: "$35-50K" },
      { value: "7", label: "$50-75K" },
      { value: "8", label: ">$75K" },
    ],
  };

  // Feature groups for UI organization
  const featureGroups = [
    {
      name: "Basic Health Indicators",
      features: ["HighBP", "HighChol", "CholCheck", "BMI", "Smoker"]
    },
    {
      name: "Medical History",
      features: ["Stroke", "HeartDiseaseorAttack", "DiffWalk"]
    },
    {
      name: "Lifestyle",
      features: ["Fruits", "Veggies", "HvyAlcoholConsump", "PhysActivity"]
    },
    {
      name: "Healthcare Access",
      features: ["AnyHealthcare", "NoDocbcCost"]
    },
    {
      name: "Health Status",
      features: ["GenHlth", "MentHlth", "PhysHlth"]
    },
    {
      name: "Demographics",
      features: ["Sex", "Age", "Education", "Income"]
    }
  ];

  // Render a binary feature input (Yes/No radio buttons)
  const renderBinaryFeature = (name, description) => {
    return (
      <div className="mb-4" key={name}>
        <label className="block text-sm font-medium text-gray-700 mb-1">{description}</label>
        <div className="flex gap-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name={name}
              value="0"
              checked={formData[name] === "0"}
              onChange={handleChange}
              className="form-radio h-4 w-4 text-blue-600"
            />
            <span className="ml-2">No</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name={name}
              value="1"
              checked={formData[name] === "1"}
              onChange={handleChange}
              className="form-radio h-4 w-4 text-blue-600"
            />
            <span className="ml-2">Yes</span>
          </label>
        </div>
      </div>
    );
  };

  // Render a dropdown select input
  const renderSelectInput = (name, description, options) => {
    return (
      <div className="mb-4" key={name}>
        <label className="block text-sm font-medium text-gray-700 mb-1">{description}</label>
        <select
          name={name}
          value={formData[name]}
          onChange={handleChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  };

  // Render a numeric input
  const renderNumericInput = (name, description, min, max) => {
    return (
      <div className="mb-4" key={name}>
        <label className="block text-sm font-medium text-gray-700 mb-1">{description}</label>
        <input
          type="number"
          name={name}
          value={formData[name]}
          onChange={handleChange}
          min={min}
          max={max}
          step="1"
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">Diabetes Risk Prediction Tool</h1>
      <p className="text-gray-600 mb-8 text-center">
        Fill out the form below to assess your risk of diabetes based on health and lifestyle factors.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {featureGroups.map((group) => (
          <div key={group.name} className="p-4 border rounded-md bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{group.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.features.map((featureName) => {
                // Handle different types of features
                if (featureName === "BMI") {
                  return renderNumericInput("BMI", "Body Mass Index", 10, 50);
                } else if (featureName === "MentHlth") {
                  return renderNumericInput("MentHlth", "Days of poor mental health in past 30 days", 0, 30);
                } else if (featureName === "PhysHlth") {
                  return renderNumericInput("PhysHlth", "Days of poor physical health in past 30 days", 0, 30);
                } else if (featureName === "GenHlth") {
                  return renderSelectInput("GenHlth", "General Health", features.genHlthOptions);
                } else if (featureName === "Sex") {
                  return renderSelectInput("Sex", "Gender", features.sexOptions);
                } else if (featureName === "Age") {
                  return renderSelectInput("Age", "Age Group", features.ageOptions);
                } else if (featureName === "Education") {
                  return renderSelectInput("Education", "Education Level", features.educationOptions);
                } else if (featureName === "Income") {
                  return renderSelectInput("Income", "Income Level", features.incomeOptions);
                } else {
                  // Binary features
                  const feature = features.binaryFeatures.find(f => f.name === featureName);
                  if (feature) {
                    return renderBinaryFeature(feature.name, feature.description);
                  }
                  return null;
                }
              })}
            </div>
          </div>
        ))}

        <div className="flex justify-center mt-8">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
          >
            {loading ? "Calculating..." : "Check Diabetes Risk"}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-6 p-4 border border-red-300 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {prediction && !error && (
        <div className="mt-8 p-6 border rounded-lg bg-gray-50">
          <h2 className="text-2xl font-bold text-center mb-4">
            Your Diabetes Risk Assessment
          </h2>
          <div className="flex justify-center items-center mb-6">
            <div className={`text-white text-center font-bold rounded-full h-32 w-32 flex items-center justify-center ${
              prediction.hasDiabetes ? "bg-red-500" : "bg-green-500"
            }`}>
              <div>
                <div className="text-2xl">{Math.round(prediction.probability * 100)}%</div>
                <div className="text-sm">Risk</div>
              </div>
            </div>
          </div>
          <p className="text-center text-lg mb-4">
            {prediction.hasDiabetes 
              ? "Based on your inputs, you may have an elevated risk of diabetes." 
              : "Based on your inputs, you appear to have a lower risk of diabetes."}
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
            <p className="text-yellow-700">
              <strong>Important:</strong> This tool provides only an estimate based on statistical models and is not a medical diagnosis. Please consult a healthcare professional for proper medical advice and testing.
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>This tool is for educational purposes only and not intended to replace professional medical advice.</p>
      </div>
    </div>
  );
};

export default DiabetesPredictionTool;