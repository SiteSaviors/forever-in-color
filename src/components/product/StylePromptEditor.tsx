import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Save, X } from "lucide-react";
import { artStyles } from "@/data/artStyles";
import { useToast } from "@/hooks/use-toast";

interface StylePromptEditorProps {
  onPromptUpdate?: (styleId: number, prompt: string) => void;
}

const defaultPrompts: { [key: number]: string } = {
  1: "Keep the image exactly as is, no artistic transformation",
  2: "Transform this image into a classical oil painting style with visible brushstrokes and rich textures, maintaining the exact same subject and composition",
  4: "Transform this image with flowing watercolor effects, gentle color bleeds and dreamy transitions while preserving the original subject and scene",
  5: "Apply gentle pastel techniques to this image with soft color blends for a dreamy, calming feel, maintaining the original composition",
  6: "Transform this image into a faceted, geometric style with gem-like textures and modern patterns, keeping the same subject",
  7: "Convert this image to a bold 3D animated style with vibrant colors like popular animated movies, preserving the original subject",
  8: "Create a hand-drawn charcoal sketch version of this image with artistic shading and black-and-white tones",
  9: "Apply pop art style to this image with bold, vibrant colors and high contrast retro aesthetics",
  10: "Add high-voltage neon effects to this image with explosive energy and electric, glowing colors",
  11: "Apply futuristic cyberpunk aesthetic to this image with electric blooms and neon lighting effects",
  13: "Transform this image into modern abstract fusion with dynamic swirls and vibrant color harmony",
  15: "Add sophisticated Art Deco elegance to this image with geometric patterns and luxurious metallic accents"
};

const StylePromptEditor = ({ onPromptUpdate }: StylePromptEditorProps) => {
  const [editingStyle, setEditingStyle] = useState<number | null>(null);
  const [prompts, setPrompts] = useState(defaultPrompts);
  const [editValue, setEditValue] = useState("");
  const { toast } = useToast();

  // Load saved prompts from localStorage on component mount
  useEffect(() => {
    try {
      const savedPrompts = localStorage.getItem('stylePrompts');
      if (savedPrompts) {
        const parsedPrompts = JSON.parse(savedPrompts);
        // Merge saved prompts with defaults (in case new styles were added)
        setPrompts({ ...defaultPrompts, ...parsedPrompts });
        console.log('Loaded saved prompts from localStorage:', parsedPrompts);
      } else {
        console.log('No saved prompts found, using defaults');
      }
    } catch (error) {
      console.error('Error loading saved prompts:', error);
      toast({
        title: "Error Loading Prompts",
        description: "Failed to load saved prompts. Using defaults.",
        variant: "destructive",
      });
    }
  }, []);

  const handleEdit = (styleId: number) => {
    setEditingStyle(styleId);
    setEditValue(prompts[styleId] || "");
  };

  const handleSave = (styleId: number) => {
    const newPrompts = { ...prompts, [styleId]: editValue };
    setPrompts(newPrompts);
    setEditingStyle(null);
    onPromptUpdate?.(styleId, editValue);
    
    // Save to localStorage for persistence
    try {
      localStorage.setItem('stylePrompts', JSON.stringify(newPrompts));
      console.log('Saved prompts to localStorage:', newPrompts);
      
      toast({
        title: "Prompt Saved",
        description: `Custom prompt for ${artStyles.find(s => s.id === styleId)?.name} has been saved.`,
      });
    } catch (error) {
      console.error('Error saving prompts:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save prompt. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditingStyle(null);
    setEditValue("");
  };

  const handleReset = (styleId: number) => {
    const newPrompts = { ...prompts, [styleId]: defaultPrompts[styleId] };
    setPrompts(newPrompts);
    
    // Save to localStorage
    try {
      localStorage.setItem('stylePrompts', JSON.stringify(newPrompts));
      
      toast({
        title: "Prompt Reset",
        description: `${artStyles.find(s => s.id === styleId)?.name} prompt has been reset to default.`,
      });
    } catch (error) {
      console.error('Error resetting prompt:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Customize Style Prompts
        </h3>
        <p className="text-gray-600 text-sm">
          Edit the AI prompts used to transform your images for each style. Changes are saved automatically.
        </p>
      </div>

      <div className="grid gap-4">
        {artStyles.map((style) => (
          <Card key={style.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-medium">{style.name}</CardTitle>
                  <Badge variant="outline" className="text-xs">ID: {style.id}</Badge>
                </div>
                <div className="flex gap-2">
                  {editingStyle !== style.id && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(style.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      {prompts[style.id] !== defaultPrompts[style.id] && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReset(style.id)}
                          className="h-8 px-2 text-xs"
                        >
                          Reset
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {editingStyle === style.id ? (
                <div className="space-y-3">
                  <Textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="Enter transformation prompt..."
                    className="min-h-20 text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSave(style.id)}
                      className="h-8"
                    >
                      <Save className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancel}
                      className="h-8"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {prompts[style.id] || `No prompt set for ${style.name}`}
                  </p>
                  {prompts[style.id] !== defaultPrompts[style.id] && (
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                      Custom Prompt
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StylePromptEditor;
