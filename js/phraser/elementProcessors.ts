/** Rail Announcements Generator. By Roy Curtis, MIT license, 2018 */

/**
 * Holds methods for processing each type of phrase element into HTML, with data taken
 * from the current state. Each method takes a context object, holding data for the
 * current XML element being processed and the XML document being used.
 */
class ElementProcessors
{
    /** Reference to the toggle DOM template to clone */
    private static PS_TEMPLATE : HTMLElement;

    /** Creates and detaches the template on first create */
    private static init() : void
    {
        // TODO: This is being duplicated in various places; DRY with sugar method
        ElementProcessors.PS_TEMPLATE        = DOM.require('#phrasesetButtonTemplate');
        ElementProcessors.PS_TEMPLATE.id     = '';
        ElementProcessors.PS_TEMPLATE.hidden = false;
        ElementProcessors.PS_TEMPLATE.remove();
    }

    /** Fills in coach letters from A to Z */
    public static coach(ctx: PhraseContext)
    {
        let context = DOM.requireAttr(ctx.xmlElement, 'context');

        ctx.newElement.title       = L.TITLE_COACH(context);
        ctx.newElement.textContent = RAG.state.getCoach(context);
        ctx.newElement.tabIndex    = 1;

        ctx.newElement.dataset['context'] = context;
    }

    /** Fills in the excuse, for a delay or cancellation */
    public static excuse(ctx: PhraseContext)
    {
        ctx.newElement.title       = L.TITLE_EXCUSE();
        ctx.newElement.textContent = RAG.state.excuse;
        ctx.newElement.tabIndex    = 1;
    }

    /** Fills in integers, optionally with nouns and in word form */
    public static integer(ctx: PhraseContext)
    {
        let context  = DOM.requireAttr(ctx.xmlElement, 'context');
        let singular = ctx.xmlElement.getAttribute('singular');
        let plural   = ctx.xmlElement.getAttribute('plural');
        let words    = ctx.xmlElement.getAttribute('words');

        let int    = RAG.state.getInteger(context);
        let intStr = (words && words.toLowerCase() === 'true')
            ? L.DIGITS[int] || int.toString()
            : int.toString();

        if      (int === 1 && singular)
            intStr += ` ${singular}`;
        else if (int !== 1 && plural)
            intStr += ` ${plural}`;

        ctx.newElement.title       = L.TITLE_INTEGER(context);
        ctx.newElement.textContent = intStr;
        ctx.newElement.tabIndex    = 1;

        ctx.newElement.dataset['context'] = context;

        if (singular) ctx.newElement.dataset['singular'] = singular;
        if (plural)   ctx.newElement.dataset['plural']   = plural;
        if (words)    ctx.newElement.dataset['words']    = words;
    }

    /** Fills in the named train */
    public static named(ctx: PhraseContext)
    {
        ctx.newElement.title       = L.TITLE_NAMED();
        ctx.newElement.textContent = RAG.state.named;
        ctx.newElement.tabIndex    = 1;
    }

    /** Includes a previously defined phrase, by its `id` */
    public static phrase(ctx: PhraseContext)
    {
        let ref    = DOM.requireAttr(ctx.xmlElement, 'ref');
        let phrase = RAG.database.getPhrase(ref);

        ctx.newElement.title          = '';
        ctx.newElement.dataset['ref'] = ref;

        if (!phrase)
        {
            ctx.newElement.textContent = L.EDITOR_UNKNOWN_PHRASE(ref);
            return;
        }

        let wrapped = ElementProcessors.wrapToInner(phrase);

        // Handle phrasesets with a chance value as collapsible
        if ( ctx.xmlElement.hasAttribute('chance') )
            ElementProcessors.makeCollapsible(ctx, ref);

        ctx.newElement.appendChild(wrapped);
    }

    /** Includes a phrase from a previously defined phraseset, by its `id` */
    public static phraseset(ctx: PhraseContext)
    {
        if (!ElementProcessors.PS_TEMPLATE)
            ElementProcessors.init();

        let ref       = DOM.requireAttr(ctx.xmlElement, 'ref');
        let phraseset = RAG.database.getPhraseset(ref);
        let forcedIdx = ctx.xmlElement.getAttribute('idx');

        ctx.newElement.dataset['ref'] = ref;

        if (!phraseset)
        {
            ctx.newElement.textContent = L.EDITOR_UNKNOWN_PHRASESET(ref);
            return;
        }

        let idx = forcedIdx
            ? parseInt(forcedIdx)
            : RAG.state.getPhrasesetIdx(ref);

        let phrase   = phraseset.children[idx] as HTMLElement;
        let wrapped  = ElementProcessors.wrapToInner(phrase);
        let button   = ElementProcessors.PS_TEMPLATE.cloneNode(true) as HTMLElement;
        button.title = L.TITLE_PHRASESET(ref);

        ctx.newElement.dataset['idx'] = forcedIdx || idx.toString();

        // Handle phrasesets with a chance value as collapsible
        if ( ctx.xmlElement.hasAttribute('chance') )
            ElementProcessors.makeCollapsible(ctx, ref);

        ctx.newElement.appendChild(button);
        ctx.newElement.appendChild(wrapped);
    }

    /** Fills in the current platform */
    public static platform(ctx: PhraseContext)
    {
        ctx.newElement.title       = L.TITLE_PLATFORM();
        ctx.newElement.textContent = RAG.state.platform.join('');
        ctx.newElement.tabIndex    = 1;
    }

    /** Fills in the rail network name */
    public static service(ctx: PhraseContext)
    {
        let context = DOM.requireAttr(ctx.xmlElement, 'context');

        ctx.newElement.title       = L.TITLE_SERVICE(context);
        ctx.newElement.textContent = RAG.state.getService(context);
        ctx.newElement.tabIndex    = 1;

        ctx.newElement.dataset['context'] = context;
    }

    /** Fills in station names */
    public static station(ctx: PhraseContext)
    {
        let context = DOM.requireAttr(ctx.xmlElement, 'context');
        let code    = RAG.state.getStation(context);

        ctx.newElement.title       = L.TITLE_STATION(context);
        ctx.newElement.textContent = RAG.database.getStation(code);
        ctx.newElement.tabIndex    = 1;

        ctx.newElement.dataset['context'] = context;
    }

    /** Fills in station lists */
    public static stationlist(ctx: PhraseContext)
    {
        let context     = DOM.requireAttr(ctx.xmlElement, 'context');
        let stations    = RAG.state.getStationList(context).slice();
        let stationList = Strings.fromStationList(stations, context);

        ctx.newElement.title       = L.TITLE_STATIONLIST(context);
        ctx.newElement.textContent = stationList;
        ctx.newElement.tabIndex    = 1;

        ctx.newElement.dataset['context'] = context;
    }

    /** Fills in the time */
    public static time(ctx: PhraseContext)
    {
        let context = DOM.requireAttr(ctx.xmlElement, 'context');

        ctx.newElement.title       = L.TITLE_TIME(context);
        ctx.newElement.textContent = RAG.state.getTime(context);
        ctx.newElement.tabIndex    = 1;

        ctx.newElement.dataset['context'] = context;
    }

    /** Fills in vox parts */
    public static vox(ctx: PhraseContext)
    {
        let key = DOM.requireAttr(ctx.xmlElement, 'key');

        // TODO: Localize
        ctx.newElement.textContent    = ctx.xmlElement.textContent;
        ctx.newElement.title          = `Click to edit this phrase (${key})`;
        ctx.newElement.tabIndex       = 1;
        ctx.newElement.dataset['key'] = key;
    }

    /** Handles unknown elements with an inline error message */
    public static unknown(ctx: PhraseContext)
    {
        let name = ctx.xmlElement.nodeName;

        ctx.newElement.textContent = L.EDITOR_UNKNOWN_ELEMENT(name);
    }

    /**
     * Clones the children of the given element into a new inner span tag, so that they
     * can be made collapsible. Appends it to the new element being processed.
     */
    private static makeCollapsible(ctx: PhraseContext, ref: string) : void
    {
        let chance    = ctx.xmlElement.getAttribute('chance')!;
        let toggle    = Collapsibles.createToggle();
        let collapsed = RAG.state.getCollapsed( ref, parseInt(chance) );

        ctx.newElement.dataset['chance'] = chance;

        ctx.newElement.appendChild(toggle);
        Collapsibles.set(ctx.newElement, collapsed);
    }

    private static wrapToInner(source: HTMLElement) : HTMLElement
    {
        let inner = document.createElement('span');

        inner.classList.add('inner');
        DOM.cloneInto(source, inner);

        return inner;
    }
}