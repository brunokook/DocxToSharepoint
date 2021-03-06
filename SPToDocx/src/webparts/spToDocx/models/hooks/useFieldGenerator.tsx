import * as React from 'react';
import { useEffect } from 'react';
import { Dropdown, TextField, Toggle, IDropdownOption, DatePicker, IChoiceGroupOption, ChoiceGroup } from 'office-ui-fabric-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { FieldTypes } from '@pnp/sp/fields';
import { setModal, setSelectedFields, clearListFields } from '../redux/actions/actions';
import {setFieldValue, setInitialFields, clearFieldsVal} from '../redux/actions/fileActions';
import { IUseFieldGen, IFieldContent } from '../interfaces/IUseFieldGen';
import { DayPicker, formatDate, getFieldFormat } from '../../utils/constants';
import { IFileGeneration } from '../interfaces/ITemplateList';

export default function useFieldGen(): IUseFieldGen {
    const { isModalOpened, list: { listId, listName,file,  fileFieldRef, fields} } = useSelector((state:RootState) =>state.listReducer);
    const [numberVal, setNumVal] = React.useState<string>('');
    const dispatch = useDispatch();
    const setValue = ({value, fieldRef, field}: IFileGeneration) => dispatch(setFieldValue({field, fieldRef, value}));
    const headerText = `Lista: ${listName}`;

    function dismisModal() {
        dispatch(setModal(false));
        dispatch(clearListFields());
        dispatch(clearFieldsVal());
    }
    useEffect(() => {
        if (listId !== null && isModalOpened === true)
            dispatch(setSelectedFields(listId, fileFieldRef));
    }, [isModalOpened]);

    function renderFields(field: IFieldContent, idx: number): JSX.Element {
        const setBoolValue = (check:boolean) => {
                if (check === true)
                setValue({field: field.Title, fieldRef: field.documentFieldRef, value: 'Sim'});
                else  setValue({field: field.Title, fieldRef: field.documentFieldRef, value: 'Não'});
        };
        const setTextFieldValue = (e) => setValue({field: field.Title, value: e.target.value, fieldRef: field.documentFieldRef});
        const setDropDownValue = (opt) => setValue({field: field.Title, fieldRef: field.documentFieldRef, value: opt.text});

        switch (field.FieldTypeKind) {
            case FieldTypes.Boolean:
                return (<><label>{field.Title}</label>
                    <Toggle defaultChecked={false} id={field.InternalName} onText={'Sim'} offText={'Não'} onChanged={setBoolValue}/></>);
            case FieldTypes.Text:
                return (<><label>{field.Title}</label>
                    <TextField id={field.InternalName} onChange={setTextFieldValue}/></>);
            case FieldTypes.Note:
                return (<><label>{field.Title}</label>
                    <TextField id={field.InternalName} multiline resizable={false} onChange={setTextFieldValue}/></>);
            case FieldTypes.Number:
                return (<><label>{field.Title}</label>
                    <TextField id={field.InternalName} defaultValue={numberVal} onChange={setTextFieldValue}/></>);
            
            case FieldTypes.Choice: {
                let formatType = getFieldFormat(field.SchemaXml, 'Format');
                if(formatType === "Dropdown"){
                    const choices: IDropdownOption[] = [];
                    field.Choices.forEach((text, index) => choices.push({ key: index, text: text }));
                    return (<><label>{field.Title}</label>
                        <Dropdown  id={field.InternalName} onChanged={setDropDownValue} options={choices} /></>);
                }
                if(formatType === "RadioButtons"){
                    const groups: IChoiceGroupOption[]=[];
                    field.Choices.forEach((text,index) => groups.push({key: index.toString(), text: text}));
                    return(<><label>{field.Title}</label>
                             <ChoiceGroup id={field.InternalName} onChanged={setDropDownValue} options={groups}/></>);
                }
            }
            case FieldTypes.MultiChoice: {
                const multiChoices: IDropdownOption[] = [];
                field.Choices.forEach((text, index) => multiChoices.push({ key: index, text: text }));
                return (<><label>{field.Title}</label>
                    <Dropdown id={field.InternalName} onChanged={setDropDownValue} options={multiChoices} multiSelect /></>);
            }
            case FieldTypes.DateTime:{
                return (<><label>{field.Title}</label>
                    <DatePicker isRequired={false} allowTextInput={true} strings={DayPicker} id={field.InternalName}
                        formatDate={formatDate} 
                        onSelectDate={(date)=> setValue({field: field.Title, value: formatDate(date), fieldRef: field.documentFieldRef})}/></>);
            }
            case FieldTypes.Currency: {
                return(<><label>{field.Title}</label>
                         <TextField id={field.InternalName} onChange={setTextFieldValue}/></>);
            }
            case FieldTypes.Lookup: {
                const choices:IDropdownOption[] = [];
                field.Choices.forEach((text, key) => choices.push({key, text}));
                return(<><label>{field.Title}</label>
                         <Dropdown id={field.InternalName} onChanged={setDropDownValue} options={choices}/></>);
            }
        }
    }

    return { headerText, dismisModal, renderFields };
}