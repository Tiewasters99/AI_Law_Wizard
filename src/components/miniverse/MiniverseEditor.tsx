import React, { useState, useRef, useCallback, useMemo } from "react";
import { useMiniverseStore } from "@/stores/miniverseStore";
import { ColorPicker } from "./ColorPicker";
import { PositionControls } from "./PositionControls";

type TabType = "scene" | "objects" | "panels" | "export";

export const MiniverseEditor: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("scene");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    config,
    updateWallColor,
    updateFloorColor,
    updateObject,
    updatePanel,
    resetConfig,
    exportConfig,
    importConfig,
    setViewMode,
  } = useMiniverseStore();

  const handleExport = useCallback(() => {
    const configJson = exportConfig();
    const blob = new Blob([configJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "miniverse-config.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [exportConfig]);

  const handleImport = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.name.endsWith(".json")) {
        alert("Please select a JSON file.");
        return;
      }

      const reader = new FileReader();
      reader.onload = e => {
        try {
          const jsonString = e.target?.result as string;
          if (jsonString) {
            const success = importConfig(jsonString);
            if (success) {
              alert("Configuration imported successfully!");
              // Reset file input
              if (event.target) {
                event.target.value = "";
              }
            } else {
              alert(
                "Failed to import configuration. Please check the file format."
              );
            }
          }
        } catch (error) {
          console.error("Import error:", error);
          alert("Error reading file. Please try again.");
        }
      };
      reader.onerror = () => {
        alert("Error reading file. Please try again.");
      };
      reader.readAsText(file);
    },
    [importConfig]
  );

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  const handleViewModeChange = useCallback(() => {
    setViewMode("3d");
  }, [setViewMode]);

  const handleResetConfig = useCallback(() => {
    if (confirm("Are you sure you want to reset to default configuration?")) {
      resetConfig();
    }
  }, [resetConfig]);

  const tabs = useMemo(
    () =>
      [
        { id: "scene", label: "Scene", icon: "🏠" },
        { id: "objects", label: "Objects", icon: "🪑" },
        { id: "panels", label: "Panels", icon: "📋" },
        { id: "export", label: "Export", icon: "💾" },
      ] as const,
    []
  );

  return (
    <div className="fixed top-0 right-0 w-80 h-full bg-gradient-to-br from-slate-800/60 via-slate-900/50 to-slate-950/60 backdrop-blur-xl border-l border-slate-400/40 shadow-2xl z-50">
      {/* Header */}
      <div className="p-4 border-b border-slate-600/40">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-white">Miniverse Editor</h3>
          <button
            onClick={handleViewModeChange}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1"
            title="Switch to 3D View"
          >
            <span>👁️</span>
            <span>3D View</span>
          </button>
        </div>
        <p className="text-xs text-gray-300">Configure your 3D office space</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-600/40">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id as TabType)}
            className={`flex-1 px-3 py-2 text-xs font-medium transition-all duration-300 ${
              activeTab === tab.id
                ? "bg-slate-700/50 text-white border-b-2 border-blue-400"
                : "text-gray-400 hover:text-white hover:bg-slate-700/30"
            }`}
          >
            <div className="flex items-center justify-center space-x-1">
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 h-[calc(100vh-140px)] overflow-y-auto">
        {activeTab === "scene" && (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">
                Room Colors
              </h4>
              <div className="space-y-4">
                <ColorPicker
                  label="Wall Color"
                  value={config.walls.color}
                  onChange={updateWallColor}
                />
                <ColorPicker
                  label="Floor Color"
                  value={config.floor.color}
                  onChange={updateFloorColor}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "objects" && (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">
                Room Objects
              </h4>

              {/* Chairs */}
              <div className="mb-6">
                <h5 className="text-xs font-medium text-gray-300 mb-3">
                  Chairs
                </h5>
                <div className="space-y-3">
                  {config.objects.chairs.map((chair, index) => (
                    <div
                      key={chair.id}
                      className="bg-slate-700/30 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-300">
                          Chair {index + 1}
                        </span>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={chair.visible}
                            onChange={e =>
                              updateObject("chairs", chair.id, {
                                visible: e.target.checked,
                              })
                            }
                            className="w-3 h-3 rounded border-slate-400/40 bg-slate-600"
                          />
                          <span className="text-xs text-gray-400">Visible</span>
                        </label>
                      </div>
                      <PositionControls
                        label="Position"
                        position={chair.position}
                        onChange={position =>
                          updateObject("chairs", chair.id, { position })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="mb-6">
                <h5 className="text-xs font-medium text-gray-300 mb-3">
                  Conference Table
                </h5>
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-300">Table</span>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={config.objects.table.visible}
                        onChange={e =>
                          updateObject("table", config.objects.table.id, {
                            visible: e.target.checked,
                          })
                        }
                        className="w-3 h-3 rounded border-slate-400/40 bg-slate-600"
                      />
                      <span className="text-xs text-gray-400">Visible</span>
                    </label>
                  </div>
                  <PositionControls
                    label="Position"
                    position={config.objects.table.position}
                    onChange={position =>
                      updateObject("table", config.objects.table.id, {
                        position,
                      })
                    }
                  />
                  <ColorPicker
                    label="Color"
                    value={config.objects.table.color || "#1f2937"}
                    onChange={color =>
                      updateObject("table", config.objects.table.id, { color })
                    }
                    className="mt-3"
                  />
                </div>
              </div>

              {/* Lamps */}
              <div className="mb-6">
                <h5 className="text-xs font-medium text-gray-300 mb-3">
                  Lamps
                </h5>
                <div className="space-y-3">
                  {config.objects.lamps.map((lamp, index) => (
                    <div
                      key={lamp.id}
                      className="bg-slate-700/30 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-300">
                          Lamp {index + 1}
                        </span>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={lamp.visible}
                            onChange={e =>
                              updateObject("lamps", lamp.id, {
                                visible: e.target.checked,
                              })
                            }
                            className="w-3 h-3 rounded border-slate-400/40 bg-slate-600"
                          />
                          <span className="text-xs text-gray-400">Visible</span>
                        </label>
                      </div>
                      <PositionControls
                        label="Position"
                        position={lamp.position}
                        onChange={position =>
                          updateObject("lamps", lamp.id, { position })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Plants */}
              <div className="mb-6">
                <h5 className="text-xs font-medium text-gray-300 mb-3">
                  Plants
                </h5>
                <div className="space-y-3">
                  {config.objects.plants.map((plant, index) => (
                    <div
                      key={plant.id}
                      className="bg-slate-700/30 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-300">
                          Plant {index + 1}
                        </span>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={plant.visible}
                            onChange={e =>
                              updateObject("plants", plant.id, {
                                visible: e.target.checked,
                              })
                            }
                            className="w-3 h-3 rounded border-slate-400/40 bg-slate-600"
                          />
                          <span className="text-xs text-gray-400">Visible</span>
                        </label>
                      </div>
                      <PositionControls
                        label="Position"
                        position={plant.position}
                        onChange={position =>
                          updateObject("plants", plant.id, { position })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "panels" && (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">
                Interactive Panels
              </h4>
              <div className="space-y-4">
                {Object.entries(config.panels).map(([panelId, panel]) => (
                  <div key={panelId} className="bg-slate-700/30 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-gray-300">
                        {panel.label}
                      </span>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={panel.visible}
                          onChange={e =>
                            updatePanel(panelId, { visible: e.target.checked })
                          }
                          className="w-3 h-3 rounded border-slate-400/40 bg-slate-600"
                        />
                        <span className="text-xs text-gray-400">Visible</span>
                      </label>
                    </div>

                    <PositionControls
                      label="Position"
                      position={panel.position}
                      onChange={position => updatePanel(panelId, { position })}
                    />

                    <div className="mt-3 space-y-2">
                      <label className="text-xs text-gray-400">
                        Size (W × H × D)
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="number"
                          value={panel.size[0]}
                          onChange={e =>
                            updatePanel(panelId, {
                              size: [
                                parseFloat(e.target.value),
                                panel.size[1],
                                panel.size[2],
                              ],
                            })
                          }
                          className="w-full px-2 py-1 text-xs bg-slate-600 border border-slate-400/40 rounded text-white"
                          step="0.1"
                        />
                        <input
                          type="number"
                          value={panel.size[1]}
                          onChange={e =>
                            updatePanel(panelId, {
                              size: [
                                panel.size[0],
                                parseFloat(e.target.value),
                                panel.size[2],
                              ],
                            })
                          }
                          className="w-full px-2 py-1 text-xs bg-slate-600 border border-slate-400/40 rounded text-white"
                          step="0.1"
                        />
                        <input
                          type="number"
                          value={panel.size[2]}
                          onChange={e =>
                            updatePanel(panelId, {
                              size: [
                                panel.size[0],
                                panel.size[1],
                                parseFloat(e.target.value),
                              ],
                            })
                          }
                          className="w-full px-2 py-1 text-xs bg-slate-600 border border-slate-400/40 rounded text-white"
                          step="0.1"
                        />
                      </div>
                    </div>

                    <ColorPicker
                      label="Color"
                      value={panel.color}
                      onChange={color => updatePanel(panelId, { color })}
                      className="mt-3"
                    />

                    <div className="mt-3">
                      <label className="text-xs text-gray-400">
                        Content URL (optional)
                      </label>
                      <input
                        type="url"
                        value={panel.contentUrl || ""}
                        onChange={e =>
                          updatePanel(panelId, { contentUrl: e.target.value })
                        }
                        placeholder="https://example.com"
                        className="w-full px-2 py-1 text-xs bg-slate-600 border border-slate-400/40 rounded text-white mt-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "export" && (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">
                Configuration
              </h4>

              <div className="space-y-4">
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <h5 className="text-xs font-medium text-gray-300 mb-2">
                    Export Configuration
                  </h5>
                  <p className="text-xs text-gray-400 mb-3">
                    Download your current configuration as a JSON file
                  </p>
                  <button
                    onClick={handleExport}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-xs font-medium transition-colors"
                  >
                    Download Config
                  </button>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-3">
                  <h5 className="text-xs font-medium text-gray-300 mb-2">
                    Import Configuration
                  </h5>
                  <p className="text-xs text-gray-400 mb-3">
                    Upload a previously saved configuration file
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-xs font-medium transition-colors"
                  >
                    Upload Config
                  </button>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-3">
                  <h5 className="text-xs font-medium text-gray-300 mb-2">
                    Reset Configuration
                  </h5>
                  <p className="text-xs text-gray-400 mb-3">
                    Reset to default configuration
                  </p>
                  <button
                    onClick={handleResetConfig}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-xs font-medium transition-colors"
                  >
                    Reset to Default
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
