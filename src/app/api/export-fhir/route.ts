import { NextResponse } from "next/server";
import { getOrCreateDefaultUser, getLatestVitals } from "@/lib/sqlite";

export async function GET() {
  try {
    const user = getOrCreateDefaultUser();
    const vitals = getLatestVitals(user.id);

    const fhirBundle = {
      resourceType: "Bundle",
      type: "collection",
      timestamp: new Date().toISOString(),
      entry: [
        {
          fullUrl: `urn:uuid:${user.id}`,
          resource: {
            resourceType: "Patient",
            id: user.id,
            active: true,
            name: [{ use: "official", family: "Vance", given: ["Alex"] }],
            gender: "male",
            birthDate: user.dob,
          },
        },
        ...vitals.map((v) => {
          let loincCode = "8867-4";
          let display = "Heart rate";
          if (v.metric_type === "BP_SYS") {
            loincCode = "8480-6";
            display = "Systolic blood pressure";
          } else if (v.metric_type === "BP_DIA") {
            loincCode = "8462-4";
            display = "Diastolic blood pressure";
          } else if (v.metric_type === "GLUCOSE") {
            loincCode = "2339-0";
            display = "Glucose [Mass/volume] in Blood";
          } else if (v.metric_type === "SPO2") {
            loincCode = "2708-6";
            display = "Oxygen saturation in Arterial blood";
          }

          return {
            fullUrl: `urn:uuid:${v.id}`,
            resource: {
              resourceType: "Observation",
              id: v.id,
              status: "final",
              code: {
                coding: [
                  {
                    system: "http://loinc.org",
                    code: loincCode,
                    display: display,
                  },
                ],
              },
              subject: {
                reference: `urn:uuid:${user.id}`,
              },
              effectiveDateTime: v.recorded_at,
              valueQuantity: {
                value: v.value,
                unit: v.unit,
                system: "http://unitsofmeasure.org",
              },
            },
          };
        }),
      ],
    };

    return new Response(JSON.stringify(fhirBundle, null, 2), {
      headers: {
        "Content-Type": "application/fhir+json",
        "Content-Disposition": 'attachment; filename="vitalis-fhir-record.json"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
