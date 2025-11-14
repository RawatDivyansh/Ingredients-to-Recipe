import React, { useEffect, useState } from 'react';
import { Recipe } from '../types';
import './RecipeStatsDashboard.css';

interface RecipeStatsDashboardProps {
  recipes: Recipe[];
}

const RecipeStatsDashboard: React.FC<RecipeStatsDashboardProps> = ({ recipes }) => {
  const [animatedTotal, setAnimatedTotal] = useState(0);
  const [animatedPerfect, setAnimatedPerfect] = useState(0);
  const [animatedAvgTime, setAnimatedAvgTime] = useState(0);

  // Calculate stats
  const totalRecipes = recipes.length;
  const perfectMatches = recipes.filter(r => r.match_percentage === 100).length;
  const averageCookingTime = recipes.length > 0
    ? Math.round(recipes.reduce((sum, r) => sum + r.cooking_time_minutes, 0) / recipes.length)
    : 0;
  const topDietaryTag = getTopDietaryTag(recipes);
  const perfectMatchPercentage = totalRecipes > 0 ? (perfectMatches / totalRecipes) * 100 : 0;

  // Animate counters on mount or when recipes change
  useEffect(() => {
    animateValue(0, totalRecipes, 800, setAnimatedTotal);
    animateValue(0, perfectMatches, 800, setAnimatedPerfect);
    animateValue(0, averageCookingTime, 800, setAnimatedAvgTime);
  }, [totalRecipes, perfectMatches, averageCookingTime]);

  function animateValue(
    start: number,
    end: number,
    duration: number,
    setter: (value: number) => void
  ) {
    const startTime = performance.now();
    const range = end - start;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuad = (t: number) => t * (2 - t);
      const easedProgress = easeOutQuad(progress);
      
      const current = Math.floor(start + range * easedProgress);
      setter(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  function getTopDietaryTag(recipes: Recipe[]): string {
    if (recipes.length === 0) return 'None';
    
    const tagCounts: Record<string, number> = {};
    recipes.forEach(recipe => {
      recipe.dietary_tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const entries = Object.entries(tagCounts);
    if (entries.length === 0) return 'None';
    
    const [topTag] = entries.reduce((max, entry) => 
      entry[1] > max[1] ? entry : max
    );
    
    return topTag.charAt(0).toUpperCase() + topTag.slice(1);
  }

  if (recipes.length === 0) {
    return null;
  }

  return (
    <div className="stats-dashboard">
      <div className="stat-card" data-tooltip="Total number of recipes found">
        <div className="stat-icon recipes-icon">🍳</div>
        <div className="stat-content">
          <div className="stat-value">{animatedTotal}</div>
          <div className="stat-label">Recipes Found</div>
        </div>
      </div>

      <div className="stat-card" data-tooltip="Recipes that match all your ingredients">
        <div className="stat-icon perfect-icon">✨</div>
        <div className="stat-content">
          <div className="stat-value">{animatedPerfect}</div>
          <div className="stat-label">Perfect Matches</div>
        </div>
        <div className="circular-progress">
          <svg className="progress-ring" width="60" height="60">
            <circle
              className="progress-ring-circle-bg"
              cx="30"
              cy="30"
              r="26"
            />
            <circle
              className="progress-ring-circle"
              cx="30"
              cy="30"
              r="26"
              style={{
                strokeDasharray: `${2 * Math.PI * 26}`,
                strokeDashoffset: `${2 * Math.PI * 26 * (1 - perfectMatchPercentage / 100)}`,
              }}
            />
          </svg>
          <div className="progress-percentage">{Math.round(perfectMatchPercentage)}%</div>
        </div>
      </div>

      <div className="stat-card" data-tooltip="Average cooking time across all recipes">
        <div className="stat-icon time-icon">⏱️</div>
        <div className="stat-content">
          <div className="stat-value">{animatedAvgTime}</div>
          <div className="stat-label">Avg. Minutes</div>
        </div>
      </div>

      <div className="stat-card" data-tooltip="Most common dietary preference">
        <div className="stat-icon dietary-icon">🥗</div>
        <div className="stat-content">
          <div className="stat-value dietary-value">{topDietaryTag}</div>
          <div className="stat-label">Top Dietary</div>
        </div>
      </div>
    </div>
  );
};

export default RecipeStatsDashboard;
