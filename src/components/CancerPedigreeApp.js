import React, { useState, useRef, useEffect } from 'react';



import { Input } from "./ui/input"



import { Label } from "./ui/label"



import { Button } from "./ui/button"



import { Card, CardHeader, CardTitle, CardContent } from "./ui/card"



import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"



import { PlusCircle, ZoomIn, ZoomOut } from 'lucide-react'







export const PersonForm = ({ isProbant = false, onDelete, member, onUpdate, onAddRelative, parentName = '' }) => {



  const handleInputChange = (e) => {



    const { name, value } = e.target;



    onUpdate({ ...member, [name]: value });



  };







  const handleSelectChange = (name, value) => {



    onUpdate({ ...member, [name]: value });



  };







  return (



    <Card className="w-full max-w-md mx-auto mb-4">



      <CardHeader>



        <CardTitle>



          {isProbant ? 'Proband Information' : 



           (parentName ? `Family Member in relation to "${parentName}"` : 'Family Member Information')}



        </CardTitle>



      </CardHeader>



      <CardContent>



        <form className="space-y-4">



          {!isProbant && (



            <div>



              <Label htmlFor="relationship">Relationship</Label>



              <Select onValueChange={(value) => handleSelectChange('relationship', value)} value={member.relationship}>



                <SelectTrigger>



                  <SelectValue placeholder="Select relationship" />



                </SelectTrigger>



                <SelectContent>



                  <SelectItem value="">Select...</SelectItem>



                  <SelectItem value="parent">Parent</SelectItem>



                  <SelectItem value="child">Child</SelectItem>



                  <SelectItem value="spouse">Spouse</SelectItem>



                  <SelectItem value="sibling">Sibling</SelectItem>



                </SelectContent>



              </Select>



            </div>



          )}



          <div>



            <Label htmlFor="name">Name</Label>



            <Input



              id="name"



              name="name"



              value={member.name || ''}



              onChange={handleInputChange}



              placeholder="Enter name"



              required



            />



          </div>



          <div>



            <Label htmlFor="sex">Sex</Label>



            <Select onValueChange={(value) => handleSelectChange('sex', value)} value={member.sex || 'female'}>



              <SelectTrigger>



                <SelectValue placeholder="Select sex" />



              </SelectTrigger>



              <SelectContent>



                <SelectItem value="male">Male</SelectItem>



                <SelectItem value="female">Female</SelectItem>



              </SelectContent>



            </Select>



          </div>



          {/* Add other fields here (ageAtDiagnosis, cancers, genetics, hasDisease, isDead) */}



          <div className="flex justify-between">



            {!isProbant && (



              <Button type="button" variant="destructive" onClick={onDelete} className="bg-red-500 hover:bg-red-600">Delete</Button>



            )}



            <Button type="button" onClick={onAddRelative} className="ml-2">



              <PlusCircle className="mr-2 h-4 w-4" /> Add Relative



            </Button>



          </div>



        </form>



      </CardContent>



    </Card>



  );



};







const CancerPedigreeApp = () => {
  const [familyMembers, setFamilyMembers] = useState([{
    id: 'proband',
    name: '',
    sex: 'female',
    ageAtDiagnosis: '',
    cancers: '',
    genetics: '',
    hasDisease: false,
    isDead: false,
    relationship: 'proband',
    x: 325,
    y: 325,
    parentId: null
  }]);
  const [showPedigree, setShowPedigree] = useState(true);
  const canvasRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(null);

  // ... Add all the functions (addFamilyMember, deleteFamilyMember, updateFamilyMember, etc.) here ...

  useEffect(() => {
    drawPedigree();
  }, [familyMembers, scale, offset]);

  return (
    <div className="flex h-screen" onKeyDown={handleKeyDown} tabIndex="0">
      <div className="w-1/3 p-4 overflow-y-auto">
        {familyMembers.map((member) => {
          const parentMember = member.parentId ? familyMembers.find(m => m.id === member.parentId) : null;
          return (
            <PersonForm 
              key={member.id}
              isProbant={member.id === 'proband'}
              member={member}
              onDelete={() => deleteFamilyMember(member.id)}
              onUpdate={updateFamilyMember}
              onAddRelative={() => addFamilyMember(member.id)}
              parentName={parentMember ? parentMember.name : ''}
            />
          );
        })}
      </div>
      <div className="w-2/3 p-4 relative">
        <div className="absolute top-2 right-2 flex space-x-2">
          <Button onClick={() => handleZoom(true)} size="sm">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button onClick={() => handleZoom(false)} size="sm">
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>
        <canvas 
          ref={canvasRef} 
          width={650} 
          height={650} 
          style={{border: '1px solid black'}}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>
    </div>
  );
};

export default CancerPedigreeApp;
