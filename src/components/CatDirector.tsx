import cat from '../assets/cat-director@480.png';

type Pose = 'peek' | 'perch' | 'cheer';

/** 猫导演：开场探头 / 运算监工 / 结果吐槽，同一张插画三种姿态（CSS 摆位） */
export function CatDirector({ pose, className = '' }: { pose: Pose; className?: string }) {
  return (
    <img
      src={cat}
      alt="猫导演"
      draggable={false}
      className={`cat cat-${pose} ${className}`}
    />
  );
}
