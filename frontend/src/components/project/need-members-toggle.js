import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export  function NeedMembersToggle({ projectId, initialState, onToggle }) {
  const [needsMembers, setNeedsMembers] = useState(initialState);
    const [localInitialState, setLocalInitialState] = useState(initialState)

    useEffect(()=>{
        setNeedsMembers(initialState)
        setLocalInitialState(initialState)
    }, [initialState]);


  const handleToggle = (checked) => {
    if(checked !== localInitialState){
    setNeedsMembers(checked);
    onToggle(projectId, checked);
    setLocalInitialState(checked)
    }

  };

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id={`need-members-${projectId}`}
        checked={needsMembers}
        onCheckedChange={handleToggle}
      />
      <Label htmlFor={`need-members-${projectId}`}>
        {needsMembers ? "Seeking Members" : "Team Complete"}
      </Label>
    </div>
  );
}