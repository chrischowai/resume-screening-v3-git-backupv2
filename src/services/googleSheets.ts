export interface CandidateData {
  name: string;
  age: string | number;
  current_job_title: string;
  current_company: string;
  industry: string;
  matching_score: number;
  years_experience: string | number;
  qualification: string;
  key_skills: string;
  gdrivelink: string;
  linkedin_snippet: string;
  marital_status: string;
  cert_and_license: string;
  language: string;
  loyalty: string;
  expected_salary: string;
  phone: string;
  questions: string;
  score_breakdown: string;
  [key: string]: string | number | undefined;
}

export class GoogleSheetsService {
  // 呼叫剛才部署的 Edge Function
  static async fetchCandidateData(): Promise<CandidateData[]> {
    try {
      const res = await fetch(
  "https://wvtojojfwkryzixshczr.supabase.co/functions/v1/fetch-sheet"
);
      if (!res.ok) throw new Error(`Fetch sheet failed: ${res.status}`);
      const data = await res.json();
      // data.values 為 2D 陣列：第一列 headers，其餘為資料
      return this.valuesToCandidates(data.values);
    } catch (e) {
      console.error("Error fetching sheet via Service Account:", e);
      return [];
    }
  }

  private static valuesToCandidates(values: any[][]): CandidateData[] {
    if (!values || values.length < 2) return [];

    const headers = values[0].map((h: string) => h.toLowerCase().trim());
    const rows = values.slice(1);

    return rows.map((row) => {
      const get = (names: string[]): string => {
        for (const n of names) {
          const idx = headers.indexOf(n.toLowerCase());
          if (idx !== -1 && row[idx] != null) {
            return String(row[idx]).trim();
          }
        }
        return "";
      };

      const candidate: CandidateData = {
        name: get(["name", "candidate name", "full name"]),
        age: get(["age", "candidate age"]) || "NA",
        current_job_title: get(["job title", "current title", "position"]) || "NA",
        current_company: get(["current company", "company", "employer"]) || "NA",
        industry: get(["industry", "sector", "field"]) || "NA",
        matching_score: parseFloat(get(["matching score", "score", "match score"])) || 0,
        years_experience: get(["years experience", "experience"]) || "NA",
        qualification: get(["qualification", "education", "degree"]) || "NA",
        key_skills: get(["key skills", "skills"]) || "",
        gdrivelink: get(["gdrivelink", "resume link", "cv link"]) || "",
        linkedin_snippet: get(["linkedin snippet", "snippet", "profile summary"]) || "",
        marital_status: get(["marital status", "marriage status"]) || "NA",
        cert_and_license: get(["cert and license", "certifications", "licenses"]) || "NA",
        language: get(["language", "languages"]) || "NA",
        loyalty: get(["loyalty", "retention"]) || "NA",
        expected_salary: get(["expected salary", "salary expectation"]) || "NA",
        phone: get(["phone", "phone number", "contact number", "mobile"]) || "NA",
        questions: get(["questions", "screening questions"]) || "NA",
        score_breakdown: get(["score breakdown", "breakdown"]) || "NA",
      };

      return candidate;
    });
  }
}
