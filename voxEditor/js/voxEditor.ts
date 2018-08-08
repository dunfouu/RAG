/** Rail Announcements Generator. By Roy Curtis, MIT license, 2018 */

/// <reference path="../../js/rag.d.ts"/>

import {Captioner} from "./captioner";
import {EditorConfig} from "./editorConfig";
import {EditorViews} from "./ui/editorViews";

/** Main class of vox editor application in the renderer process */
export class VoxEditor
{
    /** Gets the voice bank generator, which turns phrase data into a set of IDs */
    public static banker   : Captioner;
    /** Gets the configuration holder */
    public static config   : EditorConfig;
    /** Gets the database manager, which holds phrase, station and train data */
    public static database : Database;
    /** Gets the view controller, which manages UI interaction */
    public static views    : EditorViews;

    /** Entry point for VoxEditor when loading as the HTML view */
    public static main(dataRefs: DataRefs) : void
    {
        console.log('VOX Editor renderer', process.version);

        I18n.init();

        VoxEditor.config   = new EditorConfig(true);
        VoxEditor.database = new Database(dataRefs);
        VoxEditor.banker   = new Captioner();
        VoxEditor.views    = new EditorViews();
    }
}