import React, { useState, useRef, useEffect, useCallback } from 'react';
import { jsPDF } from "jspdf";

import logoImage from './images.png'; // Add this import at the top of the file
import { instructions } from './instructions';

import { Input } from "./components/ui/input"
import { Label } from "./components/ui/label"
import { Button } from "./components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "./components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select"
import { PlusCircle, ZoomIn, ZoomOut, Download, Upload, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, FileText, Clipboard, Loader2, Cpu, FilePlus } from 'lucide-react'

const PersonForm = ({ isProbant = false, onDelete, member, onUpdate, onAddRelative, parentName = '', isHighlighted = false, familyMembers, onFormClick }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let updatedMember = { ...member, [name]: value };
    
    // Automatically set hasDisease based on cancer field
    if (name === 'cancers') {
      updatedMember.hasDisease = value.trim() !== '';
    }
    
    onUpdate(updatedMember);
  };

  const handleSelectChange = (name, value) => {
    onUpdate({ ...member, [name]: value });
  };

  const isSpouse = member.relationship === 'related_spouse' || member.relationship === 'unrelated_spouse';

  const getFormTitle = () => {
    if (isProbant) return 'Proband Information';
    if (member.relationship === 'parent') return `Parent of ${parentName}`;
    if (member.relationship === 'child') {
      const parents = familyMembers.filter(m => m.id === member.parentId || m.spouseId === member.parentId);
      const parentNames = parents.map(p => p.name).join(' and ');
      return `Child of ${parentNames}`;
    }
    if (isSpouse) return `Spouse of ${parentName}`;
    return `Family Member Information (${member.relationship} of ${parentName})`;
  };

  const handleInteraction = () => {
    onFormClick(member.id);
  };

  return (
    <Card 
      className={`w-full max-w-2xl mx-auto mb-4 ${isHighlighted ? 'ring-2 ring-blue-500' : ''}`}
      id={`form-${member.id}`}
    >
      <CardHeader>
        <CardTitle>{getFormTitle()}</CardTitle>
      </CardHeader>

      <CardContent>
        <form className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={member.name || ''}
              onChange={handleInputChange}
              onFocus={handleInteraction}
              onClick={handleInteraction}
              placeholder="Enter name"
              required
            />
          </div>

          <div>
            <Label htmlFor="sex">Sex</Label>
            <Select 
              onValueChange={(value) => handleSelectChange('sex', value)} 
              value={member.sex || 'female'}
              onFocus={handleInteraction}
              onClick={handleInteraction}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select sex" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="ageAtDiagnosis">Age at Diagnosis of 1st cancer</Label>
            <Input
              id="ageAtDiagnosis"
              name="ageAtDiagnosis"
              value={member.ageAtDiagnosis || ''}
              onChange={handleInputChange}
              onFocus={handleInteraction}
              onClick={handleInteraction}
              placeholder="Enter age at diagnosis of 1st cancer"
            />
          </div>

          <div>
            <Label htmlFor="cancers">Cancer(s)</Label>
            <Input
              id="cancers"
              name="cancers"
              value={member.cancers || ''}
              onChange={handleInputChange}
              onFocus={handleInteraction}
              onClick={handleInteraction}
              placeholder="Enter cancer types"
            />
          </div>

          <div>
            <Label htmlFor="genetics">Genetic(s)</Label>
            <Input
              id="genetics"
              name="genetics"
              value={member.genetics || ''}
              onChange={handleInputChange}
              onFocus={handleInteraction}
              onClick={handleInteraction}
              placeholder="Enter genetic information"
            />
          </div>

          <div>
            <Label htmlFor="isDead">Is Deceased</Label>
            <Select 
              onValueChange={(value) => handleSelectChange('isDead', value === 'true')} 
              value={(member.isDead || false).toString()} 
              onFocus={handleInteraction} 
              onClick={handleInteraction}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select living status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isSpouse && (
            <div className="col-span-2 mt-4">
              <h3 className="text-lg font-semibold mb-2">Marriage</h3>
              <div className="flex items-center space-x-4 mb-2">
                <Select 
                  onValueChange={(value) => handleSelectChange('marriageType', value)} 
                  value={member.marriageType || 'non-consanguineous'}
                  onFocus={handleInteraction}
                  onClick={handleInteraction}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select marriage type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consanguineous">Consanguineous</SelectItem>
                    <SelectItem value="non-consanguineous">Non-consanguineous</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="col-span-2 flex justify-between mt-4">
            {!isProbant && (
              <Button 
                type="button" 
                onClick={onDelete} 
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Delete
              </Button>
            )}
            <div className="flex space-x-2">
              <Button type="button" onClick={() => onAddRelative(member.id, 'parent')} className="bg-blue-500 hover:bg-blue-600 text-white">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Parent
              </Button>
              {isSpouse && (
                <Button type="button" onClick={() => onAddRelative(member.id, 'child')} className="bg-green-500 hover:bg-green-600 text-white">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Child
                </Button>
              )}
              {!isSpouse && (
                <Button type="button" onClick={() => onAddRelative(member.id, 'spouse')} className="bg-purple-500 hover:bg-purple-600 text-white">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Spouse
                </Button>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

const Legend = ({ cancerTypes }) => (
  <div className="bg-white p-4 rounded shadow-md">
    <h3 className="text-lg font-semibold mb-2">Cancer Types</h3>
    {Object.entries(cancerTypes).map(([cancer, color]) => (
      <div key={cancer} className="flex items-center mb-1">
        <div 
          className="w-4 h-4 mr-2" 
          style={{ backgroundColor: color }}
        ></div>
        <span>{cancer}</span>
      </div>
    ))}
  </div>
);

const CancerPedigreeApp = () => {
  const [familyMembers, setFamilyMembers] = useState([{
    id: 'proband',
    name: '',
    sex: 'female',
    ageAtDiagnosis: '',
    cancers: '',
    genetics: '',
    isDead: false,
    relationship: 'proband',
    x: 325,
    y: 325,
    parentId: null
  }]);

  const canvasRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(null);
  const [highlightedMember, setHighlightedMember] = useState('proband');
  const [showFootnotes, setShowFootnotes] = useState(true);

  const cancerTypes = {
    'Breast': '#FF69B4',
    'Ovarian': '#20B2AA',
    'Colorectal': '#8B4513',
    'Prostate': '#4169E1',
    'Lung': '#708090',
    'Pancreatic': '#9932CC',
    'Other': '#808080'
  };

  const [cancerColors, setCancerColors] = useState({
    'Breast': '#FF69B4',  // Pink
    'Lung': '#4169E1',    // Blue
    'Ovary': '#2E8B57',   // Green
    'Colon': '#8B4513',   // Brown
    'Stomach': '#FFA500', // Orange
    'Brain': '#FFD700',   // Yellow
    'Leukemia': '#FF0000' // Red
  });

  const [freeTextEntries, setFreeTextEntries] = useState([]);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState(null);
  const [editingText, setEditingText] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [justFinishedPanning, setJustFinishedPanning] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [undoStack, setUndoStack] = useState([]); // Stack to keep track of movements for undo

  // Add state for medical note
  const [medicalNote, setMedicalNote] = useState('');
  const [isGeneratingNote, setIsGeneratingNote] = useState(false);
  const [showMedicalNote, setShowMedicalNote] = useState(false);

  const toggleInstructions = () => {
    setShowInstructions(prev => !prev);
  };

  const getColorForCancer = useCallback((cancer) => {
    if (cancerColors[cancer]) {
      return cancerColors[cancer];
    }
    // Generate a random color for unlisted cancers
    const newColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
    setCancerColors(prevColors => ({
      ...prevColors,
      [cancer]: newColor
    }));
    return newColor;
  }, [cancerColors]);

  const addFamilyMember = (originId, relationType) => {
    const origin = familyMembers.find(member => member.id === originId);
    let newX = origin.x;
    let newY = origin.y;
    let relationship = relationType;
    let spouseId = null;
    let sex = 'female'; // Default sex

    if (relationType === 'child') {
      if (!origin.spouseId) {
        console.error("Cannot add child without a spouse");
        return;
      }
      newY = origin.y + 100;
      const spouse = familyMembers.find(m => m.id === origin.spouseId);
      const existingChildren = familyMembers.filter(m => m.parentId === originId || m.parentId === origin.spouseId);
      if (existingChildren.length > 0) {
        const lastChild = existingChildren[existingChildren.length - 1];
        newX = lastChild.x + 50;
      } else {
        newX = (origin.x + spouse.x) / 2;
      }
    } else if (relationType === 'spouse') {
      relationship = 'unrelated_spouse'; // Default to unrelated_spouse
      newX = origin.x + 100;
      newY = origin.y;
      spouseId = origin.id;
      // Set the sex opposite to the origin's sex
      sex = origin.sex === 'male' ? 'female' : 'male';
    } else if (relationType === 'parent') {
      newY = origin.y - 100;
      newX = origin.x - 50; // Offset slightly to the left
      relationship = 'parent';
      sex = 'male'; // Set sex to male for parent
    }

    const newMember = {
      id: Date.now().toString(),
      name: '',
      sex: sex,
      ageAtDiagnosis: '',
      cancers: '',
      genetics: '',
      isDead: false,
      relationship: relationship,
      x: newX,
      y: newY,
      parentId: relationType === 'parent' ? null : (relationType === 'child' ? originId : null),
      spouseId: spouseId,
      marriageType: relationType === 'spouse' ? 'non-consanguineous' : null
    };

    setFamilyMembers(prevMembers => {
      let updatedMembers = [...prevMembers, newMember];
      if (spouseId) {
        updatedMembers = updatedMembers.map(member => 
          member.id === spouseId ? { ...member, spouseId: newMember.id } : member
        );
      }
      if (relationType === 'parent') {
        updatedMembers = updatedMembers.map(member => 
          member.id === originId ? { ...member, parentId: newMember.id } : member
        );
      }
      return updatedMembers;
    });
  };

  const deleteFamilyMember = (id) => {
    setFamilyMembers(prevMembers => prevMembers.filter(member => member.id !== id && member.parentId !== id));
  };

  const updateFamilyMember = (updatedMember) => {
    setFamilyMembers(prevMembers => 
      prevMembers.map(member => {
        if (member.id === updatedMember.id) {
          let newX = member.x;
          let newY = member.y;
          const parent = familyMembers.find(m => m.id === member.parentId);
          
          // Update position based on relationship
          if (parent && updatedMember.relationship !== member.relationship) {
            switch (updatedMember.relationship) {
              case 'parent':
                newX = parent.x;
                newY = parent.y - 100;
                break;
              case 'child':
                newX = parent.x;
                newY = parent.y + 100;
                break;
              case 'related_spouse':
              case 'unrelated_spouse':
                newX = parent.x + 100;
                newY = parent.y;
                break;
              default:
                break;
            }
          }
          
          return { ...member, ...updatedMember, x: newX, y: newY };
        }
        return member;
      })
    );
  };

  const handleZoom = (zoomIn) => {
    setScale(prevScale => {
      const newScale = zoomIn ? prevScale + 0.1 : prevScale - 0.1;
      return Math.max(0.1, Math.min(newScale, 5));
    });
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === 'z') {
      handleUndo();
    } else {
      const moveAmount = 10;
      switch (e.key) {
        case 'ArrowUp':
          setOffset(prev => ({ ...prev, y: prev.y + moveAmount }));
          break;
        case 'ArrowDown':
          setOffset(prev => ({ ...prev, y: prev.y - moveAmount }));
          break;
        case 'ArrowLeft':
          setOffset(prev => ({ ...prev, x: prev.x + moveAmount }));
          break;
        case 'ArrowRight':
          setOffset(prev => ({ ...prev, x: prev.x - moveAmount }));
          break;
        default:
          break;
      }
    }
  };

  const handleCanvasClick = (e) => {
    if (justFinishedPanning) {
      setJustFinishedPanning(false);
      return;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - offset.x) / scale;
    const y = (e.clientY - rect.top - offset.y) / scale;

    // Check if a node was clicked
    const clickedMember = familyMembers.find(member => 
      Math.abs(member.x - x) < 15 && Math.abs(member.y - y) < 15
    );

    if (clickedMember) {
      setHighlightedMember(clickedMember.id);
      const formElement = document.getElementById(`form-${clickedMember.id}`);
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }

    // Check if a text entry was clicked
    const clickedText = freeTextEntries.find(entry => 
      Math.abs(entry.x - x) < 50 && Math.abs(entry.y - y) < 10
    );

    if (clickedText) {
      setSelectedIndex(freeTextEntries.indexOf(clickedText));
      setShowOptions(true);
      return;
    }

    // If neither node nor text was clicked, add new text
    if (!isPanning) {
      const text = prompt("Enter text:");
      if (text) {
        setFreeTextEntries(prev => [...prev, { id: Date.now(), x, y, text }]);
      }
    }
  };

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - offset.x) / scale;
    const y = (e.clientY - rect.top - offset.y) / scale;
    const clickedMember = familyMembers.find(member => 
      Math.abs(member.x - x) < 15 && Math.abs(member.y - y) < 15
    );
    
    if (clickedMember) {
      setDragging(clickedMember);
    } else {
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - offset.x) / scale;
      const y = (e.clientY - rect.top - offset.y) / scale;
      
      setFamilyMembers(prevMembers => 
        prevMembers.map(member => 
          member.id === dragging.id ? { ...member, x, y } : member
        )
      );
    } else if (isPanning) {
      const dx = e.clientX - lastPanPoint.x;
      const dy = e.clientY - lastPanPoint.y;
      setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setJustFinishedPanning(true);
    }
    setDragging(null);
    setIsPanning(false);
    setLastPanPoint(null);
  };

  const handleDoubleClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - offset.x) / scale;
    const y = (e.clientY - rect.top - offset.y) / scale;
    const clickedMember = familyMembers.find(member => 
      Math.abs(member.x - x) < 15 && Math.abs(member.y - y) < 15
    );
    if (clickedMember) {
      setHighlightedMember(clickedMember.id);
      // Scroll to the highlighted form
      const formElement = document.getElementById(`form-${clickedMember.id}`);
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const drawPedigree = useCallback((context = null) => {
    const canvas = canvasRef.current;
    const ctx = context || canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    const usedCancers = new Set();

    // Draw connections
    familyMembers.forEach(member => {
      // Draw spouse connections
      if (member.spouseId) {
        const spouse = familyMembers.find(m => m.id === member.spouseId);
        if (spouse) {
          ctx.beginPath();
          ctx.strokeStyle = 'black';
          ctx.lineWidth = 1;
          const startX = Math.min(member.x, spouse.x);
          const endX = Math.max(member.x, spouse.x);
          const spouseY = member.y;
          
          // Check if it's a related spouse or consanguineous marriage and draw red line
          if (member.relationship === 'related_spouse' || spouse.relationship === 'related_spouse' || 
              member.marriageType === 'consanguineous' || spouse.marriageType === 'consanguineous') {
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            ctx.moveTo(startX, spouseY - 2);
            ctx.lineTo(endX, spouseY - 2);
            ctx.moveTo(startX, spouseY + 2);
            ctx.lineTo(endX, spouseY + 2);
          } else {
            // Unrelated spouse
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 1;
            ctx.moveTo(startX, spouseY);
            ctx.lineTo(endX, spouseY);
          }
          ctx.stroke();
        }
      }

      // Draw parent-child connections
      if (member.parentId) {
        const parent = familyMembers.find(m => m.id === member.parentId);
        if (parent) {
          const spouse = familyMembers.find(m => m.id === parent.spouseId || m.spouseId === parent.id);
          const siblings = familyMembers.filter(m => (m.parentId === member.parentId || m.parentId === spouse?.id) && m.id !== member.id);

          ctx.beginPath();
          ctx.strokeStyle = 'black';
          ctx.lineWidth = 1;

          if (spouse) {
            // Draw vertical line down from the middle of the spouse line
            const startX = Math.min(parent.x, spouse.x);
            const endX = Math.max(parent.x, spouse.x);
            const middleX = (startX + endX) / 2;
            const parentY = parent.y;
            
            // Calculate the Y position for the horizontal line
            const childrenY = Math.min(member.y, ...siblings.map(s => s.y)) - 50;
            
            // Draw vertical line from parents to horizontal line
            ctx.moveTo(middleX, parentY);
            ctx.lineTo(middleX, childrenY);

            // Draw horizontal line connecting children
            if (siblings.length > 0) {
              const childrenXs = [member, ...siblings].map(child => child.x).sort((a, b) => a - b);
              ctx.moveTo(childrenXs[0], childrenY);
              ctx.lineTo(childrenXs[childrenXs.length - 1], childrenY);

              // Draw vertical lines to each child
              [member, ...siblings].forEach(child => {
                ctx.moveTo(child.x, childrenY);
                ctx.lineTo(child.x, child.y);
              });
            } else {
              // Single child case
              ctx.lineTo(member.x, childrenY);
              ctx.lineTo(member.x, member.y);
            }
          } else {
            // Single parent case
            const midY = (parent.y + member.y) / 2;
            ctx.moveTo(parent.x, parent.y);
            ctx.lineTo(parent.x, midY);
            ctx.lineTo(member.x, midY);
            ctx.lineTo(member.x, member.y);
          }
          ctx.stroke();
        }
      }
    });

    // Draw nodes
    familyMembers.forEach(member => {
      ctx.beginPath();
      ctx.strokeStyle = 'black';
      
      const cancers = member.cancers ? member.cancers.split(',').map(c => c.trim()) : [];
      const cancerCount = cancers.length;

      if (member.sex === 'male') {
        ctx.rect(member.x - 15, member.y - 15, 30, 30);
      } else {
        ctx.arc(member.x, member.y, 15, 0, 2 * Math.PI);
      }
      
      if (cancerCount > 1) {
        // Split the node into parts
        const startAngle = -Math.PI / 2; // Start from the top
        const anglePerCancer = (2 * Math.PI) / cancerCount;

        cancers.forEach((cancer, index) => {
          ctx.beginPath();
          ctx.moveTo(member.x, member.y);
          ctx.arc(
            member.x, 
            member.y, 
            15, 
            startAngle + index * anglePerCancer, 
            startAngle + (index + 1) * anglePerCancer
          );
          ctx.closePath();
          ctx.fillStyle = getColorForCancer(cancer);
          ctx.fill();
          usedCancers.add(cancer);
        });
      } else if (cancerCount === 1) {
        ctx.fillStyle = getColorForCancer(cancers[0]);
        ctx.fill();
        usedCancers.add(cancers[0]);
      } else {
        ctx.fillStyle = 'white';
        ctx.fill();
      }
      
      ctx.stroke(); // Draw the outline

      if (member.isDead) {
        ctx.beginPath();
        ctx.moveTo(member.x - 20, member.y - 20);
        ctx.lineTo(member.x + 20, member.y + 20);
        ctx.stroke();
      }

      // Draw footnote (south-east of the node)
      if (showFootnotes) {
        ctx.font = '10px Arial';
        ctx.fillStyle = 'black';
        let xOffset = member.x + 20;
        let yOffset = member.y + 20;
        
        ctx.fillText(member.name, xOffset, yOffset);
        yOffset += 12;
        
        if (member.ageAtDiagnosis) {
          ctx.fillText(member.ageAtDiagnosis, xOffset, yOffset);
          yOffset += 12;
        }
        if (member.cancers) {
          ctx.fillText(member.cancers, xOffset, yOffset);
          yOffset += 12;
        }
        if (member.genetics) {
          ctx.fillText(member.genetics, xOffset, yOffset);
        }
      }

      // Draw sky blue halo for highlighted member
      if (member.id === highlightedMember) {
        ctx.beginPath();
        ctx.arc(member.x, member.y, 18, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(135, 206, 235, 0.6)'; // Sky blue with 60% opacity
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw arrow for proband
      if (member.id === 'proband') {
        ctx.beginPath();
        const arrowSize = 10;
        const arrowX = member.x - 20;
        const arrowY = member.y + 15; // Changed from 20 to 15 to move it higher
        
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX + arrowSize, arrowY);
        ctx.lineTo(arrowX + arrowSize / 2, arrowY + arrowSize);
        ctx.closePath();
        
        ctx.fillStyle = 'black';
        ctx.fill();
      }
    });

    // Draw free text entries
    freeTextEntries.forEach(entry => {
      ctx.font = '12px Arial';
      ctx.fillStyle = 'black';
      ctx.fillText(entry.text, entry.x, entry.y);
    });

    // Draw legend
    ctx.restore();
    if (usedCancers.size > 0) {
      const legendX = 10;
      const legendY = 10;
      const lineHeight = 20;
      const boxSize = 15;

      ctx.font = 'bold 12px Arial';
      ctx.fillStyle = 'black';
      ctx.fillText('Cancer Types:', legendX, legendY);

      let yOffset = legendY + lineHeight;
      usedCancers.forEach(cancer => {
        ctx.fillStyle = getColorForCancer(cancer);
        ctx.fillRect(legendX, yOffset, boxSize, boxSize);
        
        ctx.fillStyle = 'black';
        ctx.font = '12px Arial';
        ctx.fillText(cancer, legendX + boxSize + 5, yOffset + boxSize);
        
        yOffset += lineHeight;
      });
    }
  }, [familyMembers, scale, offset, highlightedMember, showFootnotes, getColorForCancer, freeTextEntries]);

  useEffect(() => {
    drawPedigree();
  }, [drawPedigree]);

  const savePedigreeToPDF = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Create the PDF with the same dimensions as the canvas
    const pdf = new jsPDF('l', 'pt', [canvas.width, canvas.height]);

    // Get the canvas image data
    const imgData = canvas.toDataURL('image/png');

    // Add the image to the PDF, covering the entire page
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);

    // Save the PDF
    pdf.save("pedigree.pdf");
  };

  const saveMedicalNoteToPDF = () => {
    if (!medicalNote) return;

    // Create the PDF 
    const pdf = new jsPDF();
    
    // Set font size and type
    pdf.setFontSize(12);
    
    // Split the text into lines that fit the page width
    const lines = pdf.splitTextToSize(medicalNote, 180);
    
    // Add the lines to the PDF
    pdf.text(lines, 15, 20);
    
    // Save the PDF
    pdf.save("medical_note.pdf");
  };

  const saveAsCSV = () => {
    const headers = [
        "ID", "Name", "Sex", "Age at Diagnosis", "Cancers", "Genetics", 
        "Is Deceased", "Relationship", "Parent ID", "Spouse ID", "Marriage Type",
        "X Position", "Y Position"
    ];

    // Create a map to assign new IDs starting from 1
    const idMap = {};
    familyMembers.forEach((member, index) => {
        idMap[member.id] = (index + 1).toString(); // Assign new ID starting from 1
    });

    const csvContent = familyMembers.map(member => [
        idMap[member.id], // Use new ID
        member.name,
        member.sex,
        member.ageAtDiagnosis,
        member.cancers,
        member.genetics,
        member.isDead,
        member.relationship,
        member.parentId ? idMap[member.parentId] : '',
        member.spouseId ? idMap[member.spouseId] : '',
        member.marriageType || '',
        member.x,
        member.y
    ]);

    const csvString = [
        headers.join(','),
        ...csvContent.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "pedigree_data.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };
  
  const makePedigree = (familyMembers) => {
    // Create a map of family members by ID for easy lookup
    const membersById = {};
    familyMembers.forEach(member => {
        membersById[member.id] = member;
    });

    // Find the proband
    const proband = familyMembers.find(m => m.relationship === 'proband') || familyMembers[0];
    proband.x = 325;
    proband.y = 325;

    // Keep track of visited members to avoid infinite loops
    const visited = new Set();

    // Recursive function to position members
    const positionMembers = (memberId, x, y) => {
        if (visited.has(memberId)) return;
        visited.add(memberId);

        const member = membersById[memberId];
        if (!member) return;

        member.x = x;
        member.y = y;

        // Position children
        const children = familyMembers.filter(m => m.parentId === memberId);
        children.forEach((child, index) => {
            const childX = x + index * 50;
            const childY = y + 100;
            positionMembers(child.id, childX, childY);
        });

        // Optionally position parents
        if (member.parentId) {
            const parent = membersById[member.parentId];
            if (parent && !visited.has(parent.id)) {
                const parentX = x;
                const parentY = y - 100;
                positionMembers(parent.id, parentX, parentY);
            }
        }
    };

    // Start positioning from the proband
    positionMembers(proband.id, proband.x, proband.y);

    return familyMembers;
  };

  const importFromCSV = (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            const lines = content.split('\n').filter(line => line.trim() !== ''); // Remove empty lines
            const headers = lines[0].split(',');

            const headerMap = {
                'id': 'id',
                'name': 'name',
                'sex': 'sex',
                'age at diagnosis': 'ageAtDiagnosis',
                'cancers': 'cancers',
                'genetics': 'genetics',
                'is deceased': 'isDead',
                'relationship': 'relationship',
                'parent id': 'parentId',
                'spouse id': 'spouseId',
                'marriage type': 'marriageType',
                'x position': 'x',
                'y position': 'y'
            };

            // Parse the CSV into member objects
            let importedMembers = lines.slice(1).map(line => {
                const values = line.split(',');
                const member = {};
                headers.forEach((header, index) => {
                    const key = header.trim().toLowerCase();
                    const mappedKey = headerMap[key];
                    const value = values[index]?.trim();
                    if (mappedKey) {
                        if (mappedKey === 'isDead') {
                            member[mappedKey] = value === 'true';
                        } else if (mappedKey === 'x' || mappedKey === 'y') {
                            member[mappedKey] = parseFloat(value) || null;
                        } else {
                            member[mappedKey] = value || '';
                        }
                    }
                });
                return member;
            });

            // Create a map of old IDs to new IDs
            const idMap = {};
            importedMembers.forEach((member, index) => {
                const oldId = member.id;
                const newId = (index + 1).toString();
                idMap[oldId] = newId;
                member.id = newId;
            });

            // Update relationships with new IDs
            importedMembers.forEach(member => {
                if (member.parentId) {
                    member.parentId = idMap[member.parentId] || '';
                }
                if (member.spouseId) {
                    member.spouseId = idMap[member.spouseId] || '';
                }
                
                // Ensure x and y positions exist
                if (member.x === undefined) member.x = null;
                if (member.y === undefined) member.y = null;
            });

            // Find the proband
            const proband = importedMembers.find(m => m.relationship === 'proband') || importedMembers[0];
            
            // Only set default position for proband if x and y are not already set
            if (proband.x === null || proband.y === null) {
                proband.x = 325;
                proband.y = 325;
            }

            // If any members are missing positions, calculate them
            const membersWithoutPositions = importedMembers.some(m => m.x === null || m.y === null);
            if (membersWithoutPositions) {
                // Create a map of family members by ID for easy lookup
                const membersById = {};
                importedMembers.forEach(member => {
                    membersById[member.id] = member;
                });

                // Keep track of visited members to avoid infinite loops
                const visited = new Set();

                // Recursive function to position members
                const positionMembers = (memberId, defaultX, defaultY) => {
                    if (visited.has(memberId)) return;
                    visited.add(memberId);

                    const member = membersById[memberId];
                    if (!member) return;

                    // Only set position if not already set
                    if (member.x === null || member.y === null) {
                        member.x = defaultX;
                        member.y = defaultY;
                    }

                    // Position children
                    const children = importedMembers.filter(m => m.parentId === memberId);
                    children.forEach((child, index) => {
                        const childX = member.x + index * 50;
                        const childY = member.y + 100;
                        positionMembers(child.id, childX, childY);
                    });

                    // Position spouse if exists
                    if (member.spouseId) {
                        const spouse = membersById[member.spouseId];
                        if (spouse && !visited.has(spouse.id)) {
                            const spouseX = member.x + 100;
                            const spouseY = member.y;
                            positionMembers(spouse.id, spouseX, spouseY);
                        }
                    }

                    // Position parents
                    if (member.parentId) {
                        const parent = membersById[member.parentId];
                        if (parent && !visited.has(parent.id)) {
                            const parentX = member.x;
                            const parentY = member.y - 100;
                            positionMembers(parent.id, parentX, parentY);
                        }
                    }
                };

                // Start positioning from the proband for any members without positions
                positionMembers(proband.id, proband.x, proband.y);
            }

            // Update the state with imported and positioned members
            setFamilyMembers(importedMembers);
        };
        reader.readAsText(file);
    }
  };

  const handleMove = (direction) => {
    const moveAmount = 10;
    setOffset(prev => {
      switch (direction) {
        case 'up':
          return { ...prev, y: prev.y + moveAmount };
        case 'down':
          return { ...prev, y: prev.y - moveAmount };
        case 'left':
          return { ...prev, x: prev.x + moveAmount };
        case 'right':
          return { ...prev, x: prev.x - moveAmount };
        default:
          return prev;
      }
    });
  };

  useEffect(() => {
    setHighlightedMember(null);
  }, [familyMembers]);

  const handleOptionSelect = (option) => {
    if (option === 'Edit') {
      const newText = prompt('Edit text:', freeTextEntries[selectedIndex].text);
      if (newText !== null) {
        const newTexts = [...freeTextEntries];
        newTexts[selectedIndex] = { ...newTexts[selectedIndex], text: newText };
        setFreeTextEntries(newTexts);
      }
    } else if (option === 'Delete') {
      const newTexts = freeTextEntries.filter((_, i) => i !== selectedIndex);
      setFreeTextEntries(newTexts);
    }
    setShowOptions(false);
  };

  const generateMedicalNote = async () => {
    setIsGeneratingNote(true);
    setMedicalNote('');
    
    const url = 'http://localhost:5000/api/generate-medical-note'; // Use the correct endpoint
    console.log(`Using medical note endpoint: ${url}`);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          familyMembers
        }),
      });
      
      console.log(`Response status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // The response is in data.medicalNote for this endpoint
      setMedicalNote(data.medicalNote || 'No medical note data received');
      setShowMedicalNote(true);
    } catch (error) {
      console.error('Error generating medical note:', error);
      setMedicalNote(`Error generating medical note: ${error.message}`);
      setShowMedicalNote(true);
    } finally {
      setIsGeneratingNote(false);
    }
  };
  const queryAI = async () => {
    setIsAiThinking(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ familyMembers }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setAiResponse(data.response);
    } catch (error) {
      console.error('Error querying AI:', error);
      let errorMessage = 'Error querying AI. Please try again.';
      if (error.message) {
        errorMessage += ` Error: ${error.message}`;
      }
      setAiResponse(errorMessage);
    } finally {
      setIsAiThinking(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Content copied to clipboard!');
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  };

  const handleFormClick = (memberId) => {
    setHighlightedMember(memberId);
  };

  // Add this function inside the CancerPedigreeApp component
  const handleUndo = () => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1];
      setFamilyMembers(previousState);
      setUndoStack(prevStack => prevStack.slice(0, -1));
    }
  };

  return (
    <div className="p-4 flex" onKeyDown={handleKeyDown} tabIndex="0">
      <div className="flex-grow flex flex-col lg:flex-row">
        <div className="w-full lg:w-1/2 pr-4 overflow-y-auto max-h-[calc(100vh-2rem)]" style={{ scrollbarWidth: 'thin' }}>
          {familyMembers.map((member) => {
            let relatedMemberName = '';
            
            if (member.parentId) {
              const parent = familyMembers.find(m => m.id === member.parentId);
              relatedMemberName = parent ? parent.name : '';
            } else if (member.spouseId) {
              const spouse = familyMembers.find(m => m.id === member.spouseId);
              relatedMemberName = spouse ? spouse.name : '';
            } else {
              const proband = familyMembers.find(m => m.id === 'proband');
              relatedMemberName = proband ? proband.name : '';
            }

            return (
              <PersonForm 
                key={member.id} 
                isProbant={member.id === 'proband'}
                member={member} 
                onDelete={() => deleteFamilyMember(member.id)} 
                onUpdate={updateFamilyMember}
                onAddRelative={addFamilyMember}
                parentName={relatedMemberName}
                isHighlighted={member.id === highlightedMember}
                familyMembers={familyMembers}
                onFormClick={handleFormClick}
              />
            );
          })}
        </div>

        <div className="w-full lg:w-1/2 pl-4 mt-4 lg:mt-0 sticky top-0">
          <div className="relative">
            <canvas 
              ref={canvasRef} 
              width={650} 
              height={650} 
              style={{border: '1px solid black'}}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onClick={handleCanvasClick}
            />
          </div>
        </div>
      </div>

      <div className="ml-4 flex flex-col space-y-3" style={{ width: '10%' }}>
        <a href="https://www.khcc.jo" target="_blank" rel="noopener noreferrer" className="mb-4">
          <img src={logoImage} alt="KHCC Logo" className="w-full cursor-pointer" />
        </a>

        <Button 
          onClick={() => {
            if (window.confirm('Are you sure you want to start a new pedigree? This will clear all current data.')) {
              setFamilyMembers([{
                id: 'proband',
                name: '',
                sex: 'female',
                ageAtDiagnosis: '',
                cancers: '',
                genetics: '',
                isDead: false,
                relationship: 'proband',
                x: 325,
                y: 325,
                parentId: null
              }]);
              setFreeTextEntries([]);
              setOffset({ x: 0, y: 0 });
              setScale(1);
            }
          }} 
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-xs py-2 shadow-md hover:shadow-lg transition-all duration-200"
        >
          New Pedigree
        </Button>

        <Button onClick={queryAI} 
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs py-2 shadow-md hover:shadow-lg transition-all duration-200">
          <Cpu className="h-4 w-4 mr-2" /> AI Analysis
        </Button>

        {/* Added Medical Report Button */}
        <Button 
          onClick={generateMedicalNote} 
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-xs py-2 shadow-md hover:shadow-lg transition-all duration-200"
          disabled={isGeneratingNote}
        >
          <FilePlus className="h-4 w-4 mr-2" /> 
          {isGeneratingNote ? 'Generating...' : 'Generate Report'}
        </Button>

        <Button onClick={savePedigreeToPDF} 
          className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-xs py-2 shadow-md hover:shadow-lg transition-all duration-200">
          <FileText className="h-3 w-3 mr-1" /> Save PDF
        </Button>

        <Button onClick={saveAsCSV} 
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs py-2 shadow-md hover:shadow-lg transition-all duration-200">
          <Download className="h-3 w-3 mr-1" /> Export CSV
        </Button>

        <input
          type="file"
          accept=".csv"
          onChange={importFromCSV}
          style={{ display: 'none' }}
          id="csvFileInput"
        />

        <Button 
          onClick={() => document.getElementById('csvFileInput').click()} 
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs py-2 shadow-md hover:shadow-lg transition-all duration-200">
          <Upload className="h-3 w-3 mr-1" /> Import CSV
        </Button>

        <div className="border-t border-gray-200 my-2"></div>

        <Button 
          onClick={() => setShowFootnotes(!showFootnotes)} 
          className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white text-xs py-2 shadow-md hover:shadow-lg transition-all duration-200"
        >
          {showFootnotes ? 'Hide Notes' : 'Show Notes'}
        </Button>

        <Button 
          onClick={() => handleZoom(true)} 
          className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs py-2 shadow-md hover:shadow-lg transition-all duration-200">
          <ZoomIn className="h-3 w-3 mr-1" /> Zoom In
        </Button>

        <Button 
          onClick={() => handleZoom(false)} 
          className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs py-2 shadow-md hover:shadow-lg transition-all duration-200">
          <ZoomOut className="h-3 w-3 mr-1" /> Zoom Out
        </Button>

        <Button 
          onClick={toggleInstructions} 
          className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white text-xs py-2 shadow-md hover:shadow-lg transition-all duration-200">
          Instructions
        </Button>
        </div>

{/* Modals */}
{editingText && (
  <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white p-4 rounded">
      <Input
        type="text"
        value={editingText.text}
        onChange={(e) => setEditingText({...editingText, text: e.target.value})}
        className="mb-2"
      />
      <Button onClick={() => {
        setFreeTextEntries(prev => prev.map(entry => 
          entry.id === editingText.id ? editingText : entry
        ));
        setEditingText(null);
      }}>
        Save
      </Button>
      <Button onClick={() => setEditingText(null)} className="ml-2">
        Cancel
      </Button>
    </div>
  </div>
)}

{showOptions && (
  <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white p-4 rounded">
      <Button onClick={() => handleOptionSelect('Edit')}>Edit</Button>
      <Button onClick={() => handleOptionSelect('Delete')}>Delete</Button>
    </div>
  </div>
)}

{isAiThinking && (
  <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
      <p className="text-lg font-semibold">AIDI is thinking...</p>
    </div>
  </div>
)}

{isGeneratingNote && (
  <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
      <p className="text-lg font-semibold">Generating Medical Note...</p>
    </div>
  </div>
)}

{showInstructions && (
  <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 max-w-4xl max-h-[80vh] overflow-y-auto">
      <div className="prose prose-sm max-w-none">
        <div dangerouslySetInnerHTML={{ __html: instructions.replace(/\n/g, '<br>') }} />
      </div>
      <Button onClick={toggleInstructions} className="mt-4">
        Close
      </Button>
    </div>
  </div>
)}

{aiResponse && (
  <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white p-4 rounded max-w-lg max-h-96 overflow-y-auto">
      <h2 className="text-xl font-bold mb-2">AI Response:</h2>
      <p className="whitespace-pre-wrap">{aiResponse}</p>
      <div className="mt-4 flex justify-between">
        <Button onClick={() => setAiResponse('')}>
          Close
        </Button>
        <Button onClick={() => copyToClipboard(aiResponse)} className="flex items-center">
          <Clipboard className="h-4 w-4 mr-2" /> Copy to Clipboard
        </Button>
      </div>
    </div>
  </div>
)}

{showMedicalNote && medicalNote && (
  <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white p-4 rounded max-w-2xl max-h-[80vh] overflow-y-auto">
      <h2 className="text-xl font-bold mb-2">Medical Note:</h2>
      <div className="whitespace-pre-wrap font-mono text-sm">{medicalNote}</div>
      <div className="mt-4 flex justify-between">
        <Button onClick={() => setShowMedicalNote(false)}>
          Close
        </Button>
        <div className="flex space-x-2">
          <Button onClick={() => copyToClipboard(medicalNote)} className="flex items-center">
            <Clipboard className="h-4 w-4 mr-2" /> Copy to Clipboard
          </Button>
          <Button onClick={saveMedicalNoteToPDF} className="flex items-center">
            <Download className="h-4 w-4 mr-2" /> Save as PDF
          </Button>
        </div>
      </div>
    </div>
  </div>
)}
</div>
);
};

export default CancerPedigreeApp;