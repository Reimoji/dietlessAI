import * as React from 'react';
import { BaseEmailLayout } from './base-layout';

interface WelcomeEmailProps {
  name?: string;
}

export const WelcomeEmail: React.FC<Readonly<WelcomeEmailProps>> = ({ name = '' }) => (
  <BaseEmailLayout previewText='Tere tulemast dietlessAI-sse!'>
    <h2>Tere tulemast dietlessAI-sse!</h2>
    {name && <p>Tere {name},</p>}
    <p>Aitäh, et liitusid dietlessAI-ga. Meil on hea meel toetada sind sinu toitumisteekonnal!</p>

    <p>
      Alusta vestlust oma AI-treeneriga, aktiveerides tasuta 2-päevase prooviperioodi.  
      See avab sulle personaalse ja reaalajas juhendamise, et püsiksid õigel rajal.
    </p>

    <a href={`${process.env.BASE_URL}/dashboard`} className='button'>
      Ava töölaud
    </a>

    <p>Kui sul tekib küsimusi või vajad abi, vasta lihtsalt sellele kirjale.</p>

    <p>
      Parimate soovidega,
      <br />
      dietlessAI tiim
    </p>
  </BaseEmailLayout>
);

