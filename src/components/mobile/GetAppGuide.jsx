import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, ZoomIn } from 'lucide-react';
import { MOBILE_GUIDES } from '../../config/mobileGuide';
import AttachmentImagePreview from '../AttachmentImagePreview';

function GuideScreenshot({ step, index, count }) {
  const [unavailable, setUnavailable] = useState(false);
  return <figure className="ga-feature-preview ga-guide-screen">
    <div className="ga-preview-disc" aria-hidden="true" />
    <div className="ga-guide-screen-art">
      {unavailable ? <p className="ga-guide-image-error">This screen preview is unavailable. You can still follow the instructions beside it.</p>
        : <img src={step.image} alt={step.alt} width="1356" height="2708" loading="lazy" decoding="async" onError={() => setUnavailable(true)} />}
    </div>
    <span className="ga-preview-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}<small>/ {String(count).padStart(2, '0')}</small></span>
    <figcaption><AttachmentImagePreview fileUrl={step.image} fileName={`${step.id}.webp`} mimeType="image/webp">
      {({ openPreview }) => <button data-ui="navigation" type="button" className="ga-guide-enlarge" onClick={openPreview}><ZoomIn size={16} aria-hidden="true" />Enlarge screen</button>}
    </AttachmentImagePreview></figcaption>
  </figure>;
}

export default function GetAppGuide() {
  const [audience, setAudience] = useState('staff');
  const [index, setIndex] = useState(0);
  const tabs = useRef([]);
  const roles = ['staff', 'student'];
  const guide = MOBILE_GUIDES[audience];
  const step = guide.steps[index];
  const chooseAudience = role => { setAudience(role); setIndex(0); };
  const handleRoleKey = (event, position) => {
    let next;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') next = 1 - position;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = 1;
    else return;
    event.preventDefault();
    chooseAudience(roles[next]);
    tabs.current[next]?.focus();
  };

  return <>
    <div className="ga-feature-tabs ga-guide-role-tabs" role="tablist" aria-label="Choose your VISTA Mobile guide">
      {roles.map((role, position) => <button data-ui="navigation" key={role} ref={node => { tabs.current[position] = node; }} type="button" role="tab" id={`guide-tab-${role}`} aria-controls="guide-panel" aria-selected={audience === role} tabIndex={audience === role ? 0 : -1} onClick={() => chooseAudience(role)} onKeyDown={event => handleRoleKey(event, position)}><BookOpen size={17} aria-hidden="true" />{MOBILE_GUIDES[role].label} guide</button>)}
    </div>
    <div id="guide-panel" className="ga-feature-stage ga-guide" role="tabpanel" aria-labelledby={`guide-tab-${audience}`}>
      <GuideScreenshot key={`${audience}-${step.id}`} step={step} index={index} count={guide.steps.length} />
        <div className="ga-feature-copy ga-guide-copy" id="guide-current-step">
          <p className="ga-eyebrow">{guide.label} guide · Step {index + 1} of {guide.steps.length}</p>
          <h3>{step.title}</h3>
          <p className="ga-guide-intro">{step.intro}</p>
          <ol className="ga-guide-instructions">{step.instructions.map((instruction, position) => <li key={instruction}><span aria-hidden="true">{position + 1}</span>{instruction}</li>)}</ol>
          <p className="ga-guide-tip"><strong>Keep in mind</strong>{step.tip}</p>
          <div className="ga-guide-controls">
            <button data-ui="navigation" type="button" className="ga-button ga-guide-previous" disabled={index === 0} onClick={() => setIndex(value => value - 1)}><ArrowLeft size={16} aria-hidden="true" />Previous</button>
            <span>{index + 1} / {guide.steps.length}</span>
            <button data-ui="navigation" type="button" className="ga-button ga-button-blue" disabled={index === guide.steps.length - 1} onClick={() => setIndex(value => value + 1)}>Next step<ArrowRight size={16} aria-hidden="true" /></button>
          </div>
        </div>
    </div>
    <p className="sr-only" role="status" aria-atomic="true">{guide.label} guide. Step {index + 1} of {guide.steps.length}: {step.title}</p>
    <p className="ga-guide-footer">Screens from VISTA Mobile. Your records and available actions depend on your account role.</p>
  </>;
}
