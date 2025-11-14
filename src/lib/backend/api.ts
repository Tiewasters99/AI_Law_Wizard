// API service to replace base44 functionality

interface Consultation {
  id: number;
  user_issue: string;
  status: "processing" | "completed" | "error";
  created_at: string;
  updated_at: string;
  analysis?: {
    summary: string;
    key_points: string[];
    recommendations: string[];
    legal_areas: string[];
    urgency_level: "low" | "medium" | "high" | "urgent";
    disclaimer: string;
  };
}

// Mock consultation data storage (in a real app, this would be a database)
const consultations: Consultation[] = [];
let consultationId = 1;

export const Consultation = {
  create: async (data: Partial<Consultation>): Promise<Consultation> => {
    const consultation: Consultation = {
      id: consultationId++,
      user_issue: data.user_issue || "",
      status: data.status || "processing",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    consultations.push(consultation);
    return consultation;
  },

  update: async (
    id: number,
    data: Partial<Consultation>
  ): Promise<Consultation> => {
    const index = consultations.findIndex(c => c.id === id);
    if (index !== -1) {
      consultations[index] = {
        ...consultations[index],
        ...data,
        updated_at: new Date().toISOString(),
      };
      return consultations[index];
    }
    throw new Error("Consultation not found");
  },
};
