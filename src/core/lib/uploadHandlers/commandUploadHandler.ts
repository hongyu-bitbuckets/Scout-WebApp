import { toast } from "sonner";
import { clearAllScoutingData } from "@/core/db/database";
import { clearAllPitScoutingData } from "@/core/lib/pitScoutingUtils";
import { clearGamificationData } from "@/game-template/gamification";
import { clearAllTBACache } from "@/core/lib/tbaCache";

interface ScouterCommandPayload {
  type: string;
  action: string;
}

const isClearAllDataCommand = (payload: Record<string, unknown>): boolean => {
  const type = String(payload.type || "").trim().toLowerCase();
  const action = String(payload.action || "").trim().toLowerCase();

  const validType = type === "command" || type === "scouter-command";
  const validAction =
    action === "clear-all-data" ||
    action === "clear_all_data" ||
    action === "reset-all-data";

  return validType && validAction;
};

export const handleCommandUpload = async (jsonData: unknown): Promise<void> => {
  if (!jsonData || typeof jsonData !== "object") {
    toast.error("Invalid command format");
    return;
  }

  const payload = jsonData as Record<string, unknown>;
  if (!isClearAllDataCommand(payload)) {
    toast.error("Unsupported command. Expected clear-all-data action.");
    return;
  }

  try {
    await clearAllScoutingData();
    await clearAllPitScoutingData();
    await clearGamificationData();
    await clearAllTBACache();

    localStorage.clear();

    window.dispatchEvent(new CustomEvent("scoutDataCleared"));
    window.dispatchEvent(new CustomEvent("allDataCleared"));
    window.dispatchEvent(new Event("dataChanged"));

    toast.success("Command executed: cleared all local data");
  } catch (error) {
    console.error("Error executing command upload:", error);
    toast.error("Failed to execute command");
  }
};

export type { ScouterCommandPayload };
