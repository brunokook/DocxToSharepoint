import { ITemplateField, FieldTypess, ChoiceFieldType } from '../models/interfaces/ITemplate';
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/fields"; 
import { DateTimeFieldFormatType, CalendarType, DateTimeFieldFriendlyFormatType, ChoiceFieldFormatType } from "@pnp/sp/fields/types";

export async function createList(listName: string) {
    const listAddResult = await sp.web.lists.add(listName);

    // we can work with the list created using the IListAddResult.list property:
    const listInfo = await listAddResult.list.select(listName)();
    listInfo.EnableModeration = true;
}

export async function addFields(listName: string, fields: ITemplateField[]) {
    let batch = sp.web.createBatch();
    sp.web.lists.inBatch(batch).get();
    let list = sp.web.lists.getByTitle(listName);
    
    for (const f of fields) {
      try{
        if (f.fieldType === FieldTypess.FSingleLine) {
            await list.fields.addText(f.field, 255);
            await list.fields.getByTitle(f.field).setShowInDisplayForm(true);
            await list.fields.getByTitle(f.field).setShowInEditForm(true);
       }
   
       else if (f.fieldType === FieldTypess.FNumeric) {
           await list.fields.addNumber(f.field);
           await list.fields.getByTitle(f.field).setShowInDisplayForm(true);
           await list.fields.getByTitle(f.field).setShowInEditForm(true);
       }
   
       else if (f.fieldType === FieldTypess.FChoice) {
        let type = f.choice.type;
            if(type === ChoiceFieldFormatType.Dropdown || type === ChoiceFieldFormatType.RadioButtons){
                await list.fields.addChoice(f.field, f.choice.choices, type);
                await list.fields.getByTitle(f.field).setShowInDisplayForm(true);
                await list.fields.getByTitle(f.field).setShowInEditForm(true);
            }
            else if(type === ChoiceFieldType.CheckBox){
                await list.fields.addMultiChoice(f.field, f.choice.choices);
                await list.fields.getByTitle(f.field).setShowInDisplayForm(true);
                await list.fields.getByTitle(f.field).setShowInEditForm(true);
            }
       }
   
       else if (f.fieldType === FieldTypess.FMonetary) {//1046 = R$ BRL
           await list.fields.addCurrency(f.field, undefined, undefined, 1046);
           await list.fields.getByTitle(f.field).setShowInDisplayForm(true);
           await list.fields.getByTitle(f.field).setShowInEditForm(true);
       }
   
       else if (f.fieldType === FieldTypess.FLookUp) {
                let name = f.lookup.list;
               const listLookUp = await sp.web.lists.getByTitle(name)();
               await list.fields.addLookup(f.field, listLookUp.Id, f.lookup.field);
               await list.fields.getByTitle(f.field).setShowInDisplayForm(true);
               await list.fields.getByTitle(f.field).setShowInEditForm(true);
       }
       
       else if(f.fieldType ===FieldTypess.FBool){
           await list.fields.addBoolean(f.field);
           await list.fields.getByTitle(f.field).setShowInDisplayForm(true);
           await list.fields.getByTitle(f.field).setShowInEditForm(true);
       }

       else if (f.fieldType === FieldTypess.FData) {  
           await list.fields.addDateTime(f.field, DateTimeFieldFormatType.DateOnly, CalendarType.Gregorian, DateTimeFieldFriendlyFormatType.Disabled);
           await list.fields.getByTitle(f.field).setShowInDisplayForm(true);
           await list.fields.getByTitle(f.field).setShowInEditForm(true);
       }
      }
      catch(e){console.log(e);} 
    }
}

export const loadAllLists = async () => await sp.web.lists.get();
export const loadFieldFromList = async (listName:string) => {
    let fieldInfo = await sp.web.lists.getByTitle(listName).fields.select().get();
    const userFields = fieldInfo.filter(f =>{
        return f.FromBaseType === false;
    });
    return {userFields, listName};
};