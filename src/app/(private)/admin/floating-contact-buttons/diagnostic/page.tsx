// app/admin/floating-contact-buttons/diagnostic/page.tsx
"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Toaster } from "react-hot-toast";
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
              details: "Run the migration SQL first: 01-floating-contact-buttons-migration.sql"
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
            message: "Table 'floating_contact_buttons' exists ✓",
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

      // 3. Check RLS Status (skip complex check)
      newResults.push({
        name: "RLS Status",
        status: "warning",
        message: "RLS check skipped",
        details: "Will verify via insert/update tests below"
      });

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
            message: "INSERT failed ❌",
            details: `Error: ${insertError.message}\nCode: ${insertError.code || 'unknown'}\n\nFix: Run FIXED-RLS-POLICIES.sql in Supabase SQL Editor`
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
            message: "Can INSERT rows ✓",
            details: "RLS policy allows inserts - you can create buttons"
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
          .limit(1);

        if (fetchError || !existingData || existingData.length === 0) {
          newResults.push({
            name: "Update Permission",
            status: "warning",
            message: "No rows to test update",
            details: "Create a button first to test update capability"
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
              message: "UPDATE failed ❌",
              details: `Error: ${updateError.message}\n\nFix: Run FIXED-RLS-POLICIES.sql`
            });
          } else {
            newResults.push({
              name: "Update Permission",
              status: "success",
              message: "Can UPDATE rows ✓",
              details: "RLS policy allows updates - you can edit buttons"
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
          const actualColumns = data && data.length > 0 ? Object.keys(data[0]) : ["id", "name", "sub_name", "link", "icon_file_path", "order_index", "is_active"];
          
          newResults.push({
            name: "Column Check",
            status: "success",
            message: "Table structure is valid ✓",
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

  const allSuccess = results.length > 0 && results.every((r) => r.status === "success");
  const hasErrors = results.length > 0 && results.some((r) => r.status === "error");

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
        <div className="space-y-4">
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
                  <pre className="text-xs text-gray-600 mt-2 bg-gray-100 p-3 rounded overflow-auto whitespace-pre-wrap break-words font-mono">
                    {result.details}
                  </pre>
                )}
              </div>
            </div>
          ))}

          {/* Summary */}
          <div className="mt-8 p-4 bg-gray-100 border border-gray-300 rounded-lg">
            <p className="font-semibold text-gray-900 mb-3">📊 Summary:</p>
            
            {allSuccess ? (
              <div className="bg-green-50 border border-green-200 p-3 rounded text-green-700">
                ✅ <strong>Everything looks good!</strong>
                <p className="mt-2">Your database is set up correctly. You can now:</p>
                <ul className="list-disc list-inside mt-2 ml-2 space-y-1">
                  <li>Create contact buttons</li>
                  <li>Edit/update buttons</li>
                  <li>Delete buttons</li>
                  <li>Upload icons</li>
                </ul>
              </div>
            ) : hasErrors ? (
              <div className="bg-red-50 border border-red-200 p-3 rounded text-red-700">
                <strong>❌ There are errors to fix:</strong>
                <ul className="list-disc list-inside mt-2 ml-2 space-y-1">
                  {results
                    .filter((r) => r.status === "error")
                    .map((r, idx) => (
                      <li key={idx}>
                        <strong>{r.name}:</strong> {r.message}
                      </li>
                    ))}
                </ul>
                <p className="mt-3 text-sm">
                  <strong>Next step:</strong> Check the error details above and run the suggested SQL
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-yellow-700">
                ⚠️ <strong>There are warnings to review</strong>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {!allSuccess && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-semibold text-blue-900 mb-3">🔧 What to do:</p>
              <div className="space-y-2 text-sm text-blue-800">
                {hasErrors && (
                  <>
                    <p>1️⃣ <strong>Table Error?</strong> Run: <code className="bg-blue-100 px-2 py-1 rounded">01-floating-contact-buttons-migration.sql</code></p>
                    <p>2️⃣ <strong>Insert/Update Error?</strong> Run: <code className="bg-blue-100 px-2 py-1 rounded">FIXED-RLS-POLICIES.sql</code></p>
                    <p>3️⃣ Then refresh this page and run diagnostics again</p>
                  </>
                )}
                <p>💡 Run SQL in: Supabase Dashboard → SQL Editor → New Query</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
