import { Settings, ExternalLink, Download } from 'lucide-react';
import styles from './Config.module.css';

export default function ConfigPage() {
  const configUrl = "streamfliix://config?base=https://docker-1e4b-7860.prg1.zerops.app/";

  return (
    <div className="fade-in">
      <div className={styles.header}>
        <Settings size={32} color="var(--primary)" />
        <h1 className={styles.title}>Configuration</h1>
      </div>

      <div className={styles.card}>
        <div className={styles.info}>
          <h2>App Setup</h2>
          <p>
            Configure your Streamflix instance to connect with the backend services.
            This will synchronize your settings and provide the best streaming experience.
          </p>
        </div>

        <div className={styles.actions}>
          <a href={configUrl} target="_blank" rel="noopener noreferrer" className={styles.configBtn}>
            <ExternalLink size={20} /> Configure App
          </a>
        </div>

        <div className={styles.divider} />

        <div className={styles.installInfo}>
          <div className={styles.installHeader}>
            <Download size={24} color="var(--primary)" />
            <h3>Get the Streamflix App</h3>
          </div>
          <p>
            For a better experience, offline viewing, and deep-linking support, we recommend
            installing the official Streamflix application on your device.
          </p>
          <a href="#" className={styles.installBtn}>
            Install App
          </a>
        </div>
      </div>
    </div>
  );
}
