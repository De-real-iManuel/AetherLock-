import React from 'react';
import { FixedSizeList as List } from 'react-window';

interface VirtualListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  width?: string | number;
}

/**
 * Virtual scrolling list component for rendering large lists efficiently
 * Only renders items that are visible in the viewport
 * 
 * @example
 * <VirtualList
 *   items={escrows}
 *   height={600}
 *   itemHeight={80}
 *   renderItem={(escrow) => <EscrowCard escrow={escrow} />}
 * />
 */
export function VirtualList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  className = '',
  width = '100%',
}: VirtualListProps<T>) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style} className={className}>
      {renderItem(items[index], index)}
    </div>
  );

  return (
    <List
      height={height}
      itemCount={items.length}
      itemSize={itemHeight}
      width={width}
      className={className}
    >
      {Row}
    </List>
  );
}

interface VirtualGridProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  columnCount: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  width?: string | number;
}

/**
 * Virtual scrolling grid component for rendering large grids efficiently
 * Useful for image galleries, product grids, etc.
 */
export function VirtualGrid<T>({
  items,
  height,
  itemHeight,
  columnCount,
  renderItem,
  className = '',
  width = '100%',
}: VirtualGridProps<T>) {
  const rowCount = Math.ceil(items.length / columnCount);

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const startIndex = index * columnCount;
    const endIndex = Math.min(startIndex + columnCount, items.length);
    const rowItems = items.slice(startIndex, endIndex);

    return (
      <div style={style} className={`flex gap-4 ${className}`}>
        {rowItems.map((item, i) => (
          <div key={startIndex + i} className="flex-1">
            {renderItem(item, startIndex + i)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <List
      height={height}
      itemCount={rowCount}
      itemSize={itemHeight}
      width={width}
      className={className}
    >
      {Row}
    </List>
  );
}
