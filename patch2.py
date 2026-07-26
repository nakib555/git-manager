import re

with open('src/screens/repodetails/BranchesScreen.tsx', 'r') as f:
    code = f.read()

code = code.replace(
    'const BranchLabel = ({ title, desc, isDefault = false, borderColor = \'transparent\', onDelete }: any) => {',
    'const BranchLabel = ({ title, desc, isDefault = false, isActive = false, onDelete, onSwitch }: any) => {'
)

# Update style
old_style = """    <div 
      className="flex flex-col gap-1 bg-card p-3.5 rounded-2xl border transition-all relative group" 
      style={{ borderColor: borderColor !== 'transparent' ? borderColor : 'var(--border)' }}
    >"""

new_style = """    <div 
      className={`flex flex-col gap-1 bg-card p-3.5 rounded-2xl border transition-all relative group cursor-pointer hover:border-primary/50 ${isActive ? 'border-primary ring-1 ring-primary/20' : 'border-border'}`}
      onClick={(e) => {
        if (!isConfirming) onSwitch();
      }}
    >"""

code = code.replace(old_style, new_style)

# Update the map loop
old_map = """        {filteredBranches.map(branch => (
          <BranchLabel 
            key={branch.name} 
            title={branch.name} 
            desc={branch.desc || 'Active branch'} 
            isDefault={branch.isDefault} 
            borderColor={branch.borderColor} 
            onDelete={() => deleteBranch(branch.name)}
          />
        ))}"""

new_map = """        {filteredBranches.map(branch => (
          <BranchLabel 
            key={branch.name} 
            title={branch.name} 
            desc={branch.desc || 'Active branch'} 
            isDefault={branch.isDefault} 
            isActive={branch.borderColor !== 'transparent'} 
            onDelete={() => deleteBranch(branch.name)}
            onSwitch={() => switchBranch(branch.name)}
          />
        ))}"""

code = code.replace(old_map, new_map)

# Add switchBranch to hook
code = code.replace(
    'const { activeBranches, openModal, deleteBranch } = useAppContext();',
    'const { activeBranches, openModal, deleteBranch, switchBranch, currentBranch } = useAppContext();'
)

# Replace the Check button onClick to stop propagation
old_check_button = """          <button 
            onClick={() => {
              setIsConfirming(false);
              onDelete();
            }}
            className="p-1.5 bg-error text-white rounded-lg hover:bg-error/90 transition-colors shadow-sm"
          >
            <Check size={12} />
          </button>"""

new_check_button = """          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsConfirming(false);
              onDelete();
            }}
            className="p-1.5 bg-error text-white rounded-lg hover:bg-error/90 transition-colors shadow-sm"
          >
            <Check size={12} />
          </button>"""

code = code.replace(old_check_button, new_check_button)

# Also stop propagation on the trash button and X button
old_trash = """        <button 
          onClick={() => setIsConfirming(true)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 p-2 bg-error/10 text-error rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error/20"
          title="Delete Branch"
        >"""

new_trash = """        <button 
          onClick={(e) => { e.stopPropagation(); setIsConfirming(true); }}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 p-2 bg-error/10 text-error rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error/20"
          title="Delete Branch"
        >"""

code = code.replace(old_trash, new_trash)

old_x = """          <button 
            onClick={() => setIsConfirming(false)}
            className="p-1.5 bg-hover text-text-muted rounded-lg hover:text-text-main transition-colors"
          >"""

new_x = """          <button 
            onClick={(e) => { e.stopPropagation(); setIsConfirming(false); }}
            className="p-1.5 bg-hover text-text-muted rounded-lg hover:text-text-main transition-colors"
          >"""

code = code.replace(old_x, new_x)


with open('src/screens/repodetails/BranchesScreen.tsx', 'w') as f:
    f.write(code)
