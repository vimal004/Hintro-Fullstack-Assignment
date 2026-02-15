import { useState } from "react";
import "./Tabs.css";

export default function Tabs({ tabs, activeTab, onChange, className = "" }) {
  return (
    <div className={`tabs ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tabs__tab ${activeTab === tab.id ? "tabs__tab--active" : ""}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.icon && <tab.icon size={16} />}
          <span>{tab.label}</span>
          {tab.count !== undefined && (
            <span className="tabs__count">{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}
