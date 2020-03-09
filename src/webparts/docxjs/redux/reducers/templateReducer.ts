import { ITemplateField } from './../../models/interfaces/ITemplate';
import { TemplateActions, SET_INITIAL_TEMPLATES, PopulateAction} from './../actions/actionTypes';
import { IStore } from './../../models/interfaces/IStore';
import {initialState} from '../store';
import {Reducer} from 'redux';

export const templateReducer: Reducer<IStore, TemplateActions> = (state: IStore = initialState, action: TemplateActions) =>{
    switch(action.type) {
        case SET_INITIAL_TEMPLATES: {
            const templates = [...state.templates];
            templates.unshift(...action.payload);
            return {...state, templates: templates};
        }
        case PopulateAction.POPULATE_LIST_TEMPLATE: {
            return {...state, comboOpt: action.payload.option, isEdit:{edit: action.payload.isEditing, selectedIdx: action.payload.idx}};
        }
        case PopulateAction.CHANGE_ITEM_TYPE:{
            return{ ...state, templates: state.templates.map(item =>
                item.field === action.payload.idx ? {...item, fieldType: action.payload.type}: item
            )};
        }
        default: {return state;}            
    }
};