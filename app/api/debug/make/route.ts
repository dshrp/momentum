import { NextResponse } from "next/server"

export async function GET() {
  // Debug endpoint to check Make.com environment variables
  const makeApiToken = process.env.MAKE_API_TOKEN
  const makeOrgId = process.env.MAKE_ORG_ID
  const makeTemplateId = process.env.MAKE_TEMPLATE_ID
  const makeFolderId = process.env.MAKE_FOLDER_ID

  return NextResponse.json({
    environmentCheck: {
      hasApiToken: !!makeApiToken,
      hasOrgId: !!makeOrgId,
      hasTemplateId: !!makeTemplateId,
      hasFolderId: !!makeFolderId,

      // Show lengths to verify they're not empty strings
      apiTokenLength: makeApiToken?.length || 0,
      orgIdLength: makeOrgId?.length || 0,
      templateIdLength: makeTemplateId?.length || 0,
      folderIdLength: makeFolderId?.length || 0,

      // Show first few characters to verify format (safely)
      apiTokenPrefix: makeApiToken?.substring(0, 8) + "..." || "missing",
      orgIdPrefix: makeOrgId?.substring(0, 8) + "..." || "missing",
      templateIdPrefix: makeTemplateId?.substring(0, 8) + "..." || "missing",

      // Check if they look like valid IDs
      templateIdFormat: makeTemplateId
        ? makeTemplateId.length > 10
          ? "looks valid"
          : "might be too short"
        : "missing",

      timestamp: new Date().toISOString(),
    },
  })
}
