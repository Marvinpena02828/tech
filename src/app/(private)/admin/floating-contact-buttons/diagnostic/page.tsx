// app/admin/floating-contact-buttons/diagnostic/page.tsx
"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import toast, { Toaster } from "react-hot-toast";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

interface DiagnosticResult {
  name: string;
  status: "success" | "error" | "warning";
  message: string;
  details?: string;
}

export default function DiagnosticPage() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [running, setRunning] = useState(false);

  const runDiagnostics = async () => {
    setRunning(true);
    setResults([]);
    const newResults: DiagnosticResult[] = [];

    try {
      const supabase = createClient();

      // 1. Check Authentication
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          newResults.push({
            name: "Authentication",
            status: "error",
            message: "NOT LOGGED IN",
            details: "You must be logged in to perform admin operations"
          });
        } else {
          newResults.push({
            name: "Authentication",
            status: "success",
            message: `Logged in as: ${user.email}`,
            details: `User ID: ${user.id}`
          });
        }
      } catch (e: any) {
        newResults.push({
          name: "Authentication",
          status: "error",
          message: "Auth check failed",
          details: e.message
        });
      }

      // 2. Check Table Exists
      try {
        const { data, error } = await supabase
          .from("floating_contact_buttons")
          .select("id")
          .limit(1);

        if (error) {
          if (error.message.includes("does not exist")) {
            newResults.push({
              name: "Table Check",
              status: "error",
              message: "Table 'floating_contact_buttons' does NOT exist",
              details: "Run the migration SQL first"
            });
          } else {
            newResults.push({
              name: "Table Check",
              status: "error",
              message: "Table query failed",
              details: error.message
            });
          }
        } else {
          newResults.push({
            name: "Table Check",
            status: "success",
            message: "Table 'floating_contact_buttons' exists",
            details: `Can read table (found ${data?.length || 0} rows)`
          });
        }
      } catch (e: any) {
        newResults.push({
          name: "Table Check",
          status: "error",
          message: "Table check failed",
          details: e.message
        });
      }

      // 3. Check RLS Enabled
      try {
        const { data: rlsData, error: rlsError } = await supabase
          .rpc("check_rls_enabled", {
            table_name: "floating_contact_buttons"
          })
          .catch(() => {
            // If RPC doesn't exist, we'll check via insert attempt
            return { data: null, error: null };
          });

        if (rlsData !== null) {
          newResults.push({
            name: "RLS Status",
            status: "success",
            message: "RLS is enabled",
            details: "Row-level security is active"
          });
        } else {
          newResults.push({
            name: "RLS Status",
            status: "warning",
            message: "Could not verify RLS status",
            details: "Will test via insert attempt"
          });
        }
      } catch (e: any) {
        newResults.push({
          name: "RLS Status",
          status: "warning",
          message: "RLS check skipped",
          details: "Will test via insert attempt"
        });
      }

      // 4. Check Insert Permission
      try {
        const testData = {
          name: `TEST_${Date.now()}`,
          sub_name: "test",
          link: "https://test.com",
          is_active: true,
          order_index: 999
        };

        const { data: insertData, error: insertError } = await supabase
          .from("floating_contact_buttons")
          .insert([testData])
          .select();

        if (insertError) {
          newResults.push({
            name: "Insert Permission",
            status: "error",
            message: "INSERT failed",
            details: `Error: ${insertError.message}. Code: ${insertError.code}`
          });
        } else {
          // Delete test record
          if (insertData && insertData.length > 0) {
            await supabase
              .from("floating_contact_buttons")
              .delete()
              .eq("id", insertData[0].id);
          }

          newResults.push({
            name: "Insert Permission",
            status: "success",
            message: "Can INSERT rows",
            details: "RLS policy allows inserts ✓"
          });
        }
      } catch (e: any) {
        newResults.push({
          name: "Insert Permission",
          status: "error",
          message: "Insert test failed",
          details: e.message
        });
      }

      // 5. Check Update Permission
      try {
        // First get an existing row
        const { data: existingData, error: fetchError } = await supabase
          .from("floating_contact_buttons")
          .select("id")
          .eq("is_active", true)
          .limit(1);

        if (fetchError || !existingData || existingData.length === 0) {
          newResults.push({
            name: "Update Permission",
            status: "warning",
            message: "No rows to test update",
            details: "Create a row first to test update"
          });
        } else {
          const { error: updateError } = await supabase
            .from("floating_contact_buttons")
            .update({ sub_name: "test_update" })
            .eq("id", existingData[0].id);

          if (updateError) {
            newResults.push({
              name: "Update Permission",
              status: "error",
              message: "UPDATE failed",
              details: `Error: ${updateError.message}`
            });
          } else {
            newResults.push({
              name: "Update Permission",
              status: "success",
              message: "Can UPDATE rows",
              details: "RLS policy allows updates ✓"
            });
          }
        }
      } catch (e: any) {
        newResults.push({
          name: "Update Permission",
          status: "error",
          message: "Update test failed",
          details: e.message
        });
      }

      // 6. Check Columns
      try {
        const { data, error } = await supabase
          .from("floating_contact_buttons")
          .select()
          .limit(1);

        if (error) {
          newResults.push({
            name: "Column Check",
            status: "error",
            message: "Could not read columns",
            details: error.message
          });
        } else {
          const expectedColumns = ["id", "name", "sub_name", "link", "icon_file_path", "order_index", "is_active"];
          const actualColumns = data && data.length > 0 ? Object.keys(data[0]) : [];
          
          newResults.push({
            name: "Column Check",
            status: "success",
            message: "Table structure is valid",
            details: `Columns: ${actualColumns.join(", ")}`
          });
        }
      } catch (e: any) {
        newResults.push({
          name: "Column Check",
          status: "error",
          message: "Column check failed",
          details: e.message
        });
      }

    } catch (error: any) {
      newResults.push({
        name: "Overall",
        status: "error",
        message: "Diagnostic failed",
        details: error.message
      });
    } finally {
      setResults(newResults);
      setRunning(false);
    }
  };

  const getIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle size={20} className="text-green-600" />;
      case "error":
        return <XCircle size={20} className="text-red-600" />;
      default:
        return <AlertCircle size={20} className="text-yellow-600" />;
    }
  };

  const getColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      default:
        return "bg-yellow-50 border-yellow-200";
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Toaster position="top-right" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🔧 Database Diagnostics
        </h1>
        <p className="text-gray-600">
          Run this to check if your database and permissions are set up correctly
        </p>
      </div>

      <button
        onClick={runDiagnostics}
        disabled={running}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium mb-8"
      >
        {running ? "Running diagnostics..." : "Run Diagnostics"}
      </button>

      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((result, idx) => (
            <div
              key={idx}
              className={`border rounded-lg p-4 flex gap-3 ${getColor(result.status)}`}
            >
              <div className="flex-shrink-0 mt-1">
                {getIcon(result.status)}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{result.name}</p>
                <p className="text-gray-700 mt-1">{result.message}</p>
                {result.details && (
                  <p className="text-sm text-gray-600 mt-2 font-mono bg-gray-900 text-green-400 p-2 rounded">
                    {result.details}
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Summary */}
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <p className="font-semibold text-gray-900 mb-2">Summary:</p>
            {results.every((r) => r.status === "success") ? (
              <p className="text-green-700">
                ✅ Everything looks good! Your database is set up correctly.
              </p>
            ) : results.some((r) => r.status === "error") ? (
              <div className="text-red-700 space-y-2">
                <p>❌ There are errors to fix:</p>
                <ul className="list-disc list-inside">
                  {results
                    .filter((r) => r.status === "error")
                    .map((r, idx) => (
                      <li key={idx}>{r.name}: {r.message}</li>
                    ))}
                </ul>
              </div>
            ) : (
              <p className="text-yellow-700">
                ⚠️ There are warnings to review
              </p>
            )}
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="font-bold text-blue-900 mb-4">Need Help?</h2>
        <div className="space-y-3 text-sm text-blue-800">
          <div>
            <p className="font-semibold">Auth Error?</p>
            <p>Make sure you're logged in to the admin panel first</p>
          </div>
          <div>
            <p className="font-semibold">Table Not Found?</p>
            <p>Run the migration SQL: <code className="bg-blue-100 px-2">01-floating-contact-buttons-migration.sql</code></p>
          </div>
          <div>
            <p className="font-semibold">Insert/Update Failed?</p>
            <p>Run the RLS fix: <code className="bg-blue-100 px-2">FIXED-RLS-POLICIES.sql</code></p>
          </div>
          <div>
            <p className="font-semibold">Still broken?</p>
            <p>Screenshot these results and share them!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
